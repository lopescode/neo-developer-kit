/** Shared message types exchanged between the webview and the extension host. */

export interface MethodParam {
  name: string;
  type: string;
}

export interface Method {
  name: string;
  returntype: string;
  safe: boolean;
  parameters: MethodParam[];
}

/** Messages the webview sends to the extension. */
export type WebviewMessage =
  | { type: "loadAbi"; rpc: string; contract: string }
  | {
      type: "invoke";
      rpc: string;
      contract: string;
      method: string;
      params: string;
    };

/** The VM result returned by a read-only invocation. */
export interface InvokeResult {
  state?: string;
  gasconsumed?: string;
  exception?: string | null;
  stack?: unknown[];
  [key: string]: unknown;
}

/** Messages the extension sends back to the webview. */
export type ExtensionMessage =
  | { type: "abi"; ok: true; name: string; hash: string; methods: Method[] }
  | { type: "abi"; ok: false; error: string }
  | { type: "result"; ok: true; result: InvokeResult }
  | { type: "result"; ok: false; error: string };
