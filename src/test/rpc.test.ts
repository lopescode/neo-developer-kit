import * as http from "http";
import { invokeFunction } from "../rpc";

describe("rpc.invokeFunction", () => {
  it("sends a well-formed JSON-RPC invokefunction request", async () => {
    const server = await startMockRpc({
      jsonrpc: "2.0",
      id: 1,
      result: {
        script: "abc",
        state: "HALT",
        gasconsumed: "1000000",
        exception: null,
        stack: [{ type: "Integer", value: "42" }],
      },
    });

    try {
      const params = [{ type: "Integer", value: "1" }];
      await invokeFunction(server.url, "0xcontract", "balanceOf", params);

      const body = server.getRequest();
      expect(body.jsonrpc).toBe("2.0");
      expect(body.method).toBe("invokefunction");
      expect(body.params).toEqual(["0xcontract", "balanceOf", params]);
    } finally {
      await server.close();
    }
  });

  it("returns the result object on success", async () => {
    const result = {
      script: "abc",
      state: "HALT",
      gasconsumed: "1000000",
      exception: null,
      stack: [{ type: "Integer", value: "42" }],
    };
    const server = await startMockRpc({ jsonrpc: "2.0", id: 1, result });

    try {
      const out = await invokeFunction(server.url, "0xcontract", "totalSupply");
      expect(out.state).toBe("HALT");
      expect(out.gasconsumed).toBe("1000000");
      expect(out.stack).toEqual([{ type: "Integer", value: "42" }]);
    } finally {
      await server.close();
    }
  });

  it("defaults params to an empty array", async () => {
    const server = await startMockRpc({
      jsonrpc: "2.0",
      id: 1,
      result: {
        script: "",
        state: "HALT",
        gasconsumed: "0",
        exception: null,
        stack: [],
      },
    });

    try {
      await invokeFunction(server.url, "0xcontract", "symbol");
      expect(server.getRequest().params).toEqual(["0xcontract", "symbol", []]);
    } finally {
      await server.close();
    }
  });

  it("throws a descriptive error on a JSON-RPC error response", async () => {
    const server = await startMockRpc({
      jsonrpc: "2.0",
      id: 1,
      error: { code: -32602, message: "Invalid params" },
    });

    try {
      await expect(
        invokeFunction(server.url, "0xcontract", "bad"),
      ).rejects.toThrow(/Neo RPC error -32602: Invalid params/);
    } finally {
      await server.close();
    }
  });

  it("throws when the result is empty", async () => {
    const server = await startMockRpc({ jsonrpc: "2.0", id: 1 });

    try {
      await expect(
        invokeFunction(server.url, "0xcontract", "noop"),
      ).rejects.toThrow(/empty result/);
    } finally {
      await server.close();
    }
  });
});

/**
 * Spins up a one-shot local HTTP server that responds to a single JSON-RPC POST
 * with the given response body. Captures the parsed request body for assertions.
 */
function startMockRpc(responseBody: unknown): Promise<{
  url: string;
  getRequest: () => any;
  close: () => Promise<void>;
}> {
  let captured: any;

  return new Promise((resolve) => {
    const server = http.createServer((req, res) => {
      const chunks: Buffer[] = [];
      req.on("data", (c) => chunks.push(c));
      req.on("end", () => {
        captured = JSON.parse(Buffer.concat(chunks).toString());
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify(responseBody));
      });
    });

    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as { port: number };
      resolve({
        url: `http://127.0.0.1:${port}`,
        getRequest: () => captured,
        close: () => new Promise<void>((res) => server.close(() => res())),
      });
    });
  });
}
