import * as http from "http";
import * as path from "path";
import {
  buildAbiResponse,
  buildInvokeResponse,
  getKitHtml,
  getNonce,
} from "../views/neoKitView";

// Repo root, relative to this test file (src/test/neoKitView.test.ts).
const EXTENSION_ROOT = path.join(__dirname, "..", "..");

describe("getKitHtml", () => {
  const html = getKitHtml(
    EXTENSION_ROOT,
    "vscode-resource:",
    "TESTNONCE123",
    "https://base",
  );

  it("injects the CSP with the given nonce and csp source", () => {
    expect(html).toMatch(/Content-Security-Policy/);
    expect(html).toContain("script-src 'nonce-TESTNONCE123'");
    expect(html).toContain("style-src vscode-resource: 'unsafe-inline'");
  });

  it("rewrites the React bundle to a webview URI with the nonce", () => {
    expect(html).toContain(
      '<script nonce="TESTNONCE123" src="https://base/js/webview.js"',
    );
    expect(html).not.toContain('src="./js/');
  });

  it("rewrites the stylesheet link to a webview URI", () => {
    expect(html).toContain(
      '<link rel="stylesheet" href="https://base/css/tailwind.css" />',
    );
    expect(html).not.toContain('href="./css/');
  });

  it("mounts the React root element", () => {
    expect(html).toContain('id="root"');
  });
});

describe("getNonce", () => {
  it("returns a 32-char alphanumeric string", () => {
    const nonce = getNonce();
    expect(nonce).toHaveLength(32);
    expect(nonce).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("returns different values on each call", () => {
    expect(getNonce()).not.toBe(getNonce());
  });
});

describe("buildAbiResponse", () => {
  it("returns ok:true with the methods on success", async () => {
    const server = await startMockRpc({
      jsonrpc: "2.0",
      id: 1,
      result: {
        id: 1,
        hash: "0xabc",
        manifest: {
          name: "MyToken",
          abi: {
            methods: [
              {
                name: "symbol",
                parameters: [],
                returntype: "String",
                safe: true,
              },
            ],
            events: [],
          },
        },
      },
    });

    try {
      const response = await buildAbiResponse({
        rpc: server.url,
        contract: "0xabc",
      });
      expect(response.ok).toBe(true);
      if (response.ok) {
        expect(response.name).toBe("MyToken");
        expect(response.methods).toHaveLength(1);
      }
    } finally {
      await server.close();
    }
  });

  it("returns ok:false on validation error", async () => {
    const response = await buildAbiResponse({ rpc: "", contract: "0xabc" });
    expect(response).toEqual({
      type: "abi",
      ok: false,
      error: "RPC endpoint is required.",
    });
  });
});

describe("buildInvokeResponse", () => {
  it("returns ok:true with the result on success", async () => {
    const server = await startMockRpc({
      jsonrpc: "2.0",
      id: 1,
      result: {
        script: "",
        state: "HALT",
        gasconsumed: "42",
        exception: null,
        stack: [],
      },
    });

    try {
      const response = await buildInvokeResponse({
        rpc: server.url,
        contract: "0xcontract",
        method: "symbol",
      });
      expect(response).toMatchObject({ ok: true, result: { state: "HALT" } });
    } finally {
      await server.close();
    }
  });

  it("returns ok:false on a JSON-RPC error response", async () => {
    const server = await startMockRpc({
      jsonrpc: "2.0",
      id: 1,
      error: { code: -32602, message: "Invalid params" },
    });

    try {
      const response = await buildInvokeResponse({
        rpc: server.url,
        contract: "0xcontract",
        method: "bad",
      });
      expect(response.ok).toBe(false);
      if (!response.ok) {
        expect(response.error).toMatch(/Neo RPC error -32602/);
      }
    } finally {
      await server.close();
    }
  });
});

/** One-shot JSON-RPC mock server returning a fixed result. */
function startMockRpc(
  responseBody: unknown,
): Promise<{ url: string; close: () => Promise<void> }> {
  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(responseBody));
      });
    });
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as { port: number };
      resolve({
        url: `http://127.0.0.1:${port}`,
        close: () => new Promise<void>((r) => server.close(() => r())),
      });
    });
  });
}
