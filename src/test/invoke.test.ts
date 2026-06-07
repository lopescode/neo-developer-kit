import * as http from "http";
import { loadContractAbi, parseParams, runInvoke } from "../invoke";

describe("parseParams", () => {
  it("returns [] for undefined / empty / whitespace", () => {
    expect(parseParams(undefined)).toEqual([]);
    expect(parseParams("")).toEqual([]);
    expect(parseParams("   ")).toEqual([]);
  });

  it("parses a valid JSON array of contract parameters", () => {
    expect(parseParams('[{"type":"Integer","value":"1"}]')).toEqual([
      { type: "Integer", value: "1" },
    ]);
  });

  it("throws on invalid JSON", () => {
    expect(() => parseParams("{not json")).toThrow(/valid JSON/);
  });

  it("throws when JSON is not an array", () => {
    expect(() => parseParams('{"type":"Integer"}')).toThrow(
      /must be a JSON array/,
    );
  });
});

describe("runInvoke", () => {
  it("returns the VM result on success", async () => {
    const server = await startMockRpc({
      jsonrpc: "2.0",
      id: 1,
      result: {
        script: "",
        state: "HALT",
        gasconsumed: "1000000",
        exception: null,
        stack: [],
      },
    });

    try {
      const result = await runInvoke({
        rpc: server.url,
        contract: "0xcontract",
        method: "symbol",
      });
      expect(result.state).toBe("HALT");
      expect(result.gasconsumed).toBe("1000000");
    } finally {
      await server.close();
    }
  });

  it.each([
    [{ rpc: "", contract: "0xc", method: "m" }, /RPC endpoint is required/],
    [
      { rpc: "http://x", contract: "", method: "m" },
      /Contract hash is required/,
    ],
    [
      { rpc: "http://x", contract: "0xc", method: "" },
      /Method name is required/,
    ],
  ])("rejects missing input %#", async (input, expected) => {
    await expect(runInvoke(input)).rejects.toThrow(expected);
  });

  it("rejects invalid params without hitting the network", async () => {
    await expect(
      runInvoke({
        rpc: "http://127.0.0.1:1",
        contract: "0xcontract",
        method: "symbol",
        params: "{not an array}",
      }),
    ).rejects.toThrow(/valid JSON/);
  });
});

describe("loadContractAbi", () => {
  const manifestResult = {
    id: 1,
    hash: "0xabc",
    manifest: {
      name: "MyToken",
      abi: {
        methods: [
          {
            name: "transfer",
            parameters: [{ name: "to", type: "Hash160" }],
            returntype: "Boolean",
            safe: false,
          },
          {
            name: "balanceOf",
            parameters: [{ name: "account", type: "Hash160" }],
            returntype: "Integer",
            safe: true,
          },
        ],
        events: [],
      },
    },
  };

  it("returns the contract name, hash and methods sorted by name", async () => {
    const server = await startMockRpc({
      jsonrpc: "2.0",
      id: 1,
      result: manifestResult,
    });

    try {
      const abi = await loadContractAbi({ rpc: server.url, contract: "0xabc" });
      expect(abi.name).toBe("MyToken");
      expect(abi.hash).toBe("0xabc");
      expect(abi.methods.map((m) => m.name)).toEqual(["balanceOf", "transfer"]);
    } finally {
      await server.close();
    }
  });

  it("rejects when the contract hash is missing", async () => {
    await expect(
      loadContractAbi({ rpc: "http://x", contract: "" }),
    ).rejects.toThrow(/Contract hash is required/);
  });

  it("rejects when the RPC endpoint is missing", async () => {
    await expect(
      loadContractAbi({ rpc: "", contract: "0xabc" }),
    ).rejects.toThrow(/RPC endpoint is required/);
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
