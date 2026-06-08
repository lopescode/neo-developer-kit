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

/** A public, webview-safe account (never contains key material). */
export interface WalletAccount {
  address: string;
  label: string;
  isActive: boolean;
}

/** A formatted NEP-17 token balance for display. */
export interface TokenBalance {
  symbol: string;
  amount: string;
  /** Contract script hash (`0x…`) — the only reliable token identity. */
  hash: string;
  /** True only for canonical native NEO/GAS; others can impersonate symbols. */
  trusted: boolean;
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
    }
  | { type: "wallet.list" }
  | { type: "wallet.create" }
  | { type: "wallet.import" }
  | { type: "wallet.setActive"; address: string }
  | { type: "wallet.remove"; address: string }
  | { type: "wallet.backup" }
  | { type: "wallet.balance"; address: string; rpc: string }
  | { type: "contract.selectNef" }
  | { type: "contract.selectManifest" }
  | {
      type: "contract.deploy";
      rpc: string;
      nefBase64: string;
      manifestJson: string;
    }
  | {
      type: "contract.update";
      rpc: string;
      contract: string;
      nefBase64: string;
      manifestJson: string;
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
  | { type: "result"; ok: false; error: string }
  | { type: "wallet.accounts"; ok: true; accounts: WalletAccount[] }
  | { type: "wallet.accounts"; ok: false; error: string }
  | { type: "wallet.backup"; ok: true; path: string }
  | { type: "wallet.backup"; ok: false; error: string }
  | { type: "wallet.balance"; ok: true; address: string; assets: TokenBalance[] }
  | { type: "wallet.balance"; ok: false; address: string; error: string }
  | {
      type: "contract.nef";
      ok: true;
      nefName?: string;
      nefBase64?: string;
      manifestName?: string;
      manifestJson?: string;
    }
  | { type: "contract.nef"; ok: false; error: string }
  | {
      type: "contract.manifest";
      ok: true;
      manifestName?: string;
      manifestJson?: string;
    }
  | { type: "contract.manifest"; ok: false; error: string }
  | { type: "contract.deployed"; ok: true; txid: string; contractHash: string }
  | { type: "contract.deployed"; ok: false; error: string }
  | { type: "contract.updated"; ok: true; txid: string }
  | { type: "contract.updated"; ok: false; error: string };
