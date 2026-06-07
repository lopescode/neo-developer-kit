export interface WalletAccount {
  address: string;
  label: string;
  isActive: boolean;
}

export interface TokenBalance {
  symbol: string;
  amount: string;
  hash: string;
  trusted: boolean;
}

export type WalletMessage =
  | { type: "wallet.list" }
  | { type: "wallet.create" }
  | { type: "wallet.import" }
  | { type: "wallet.setActive"; address: string }
  | { type: "wallet.remove"; address: string }
  | { type: "wallet.backup" }
  | { type: "wallet.balance"; address: string; rpc: string };

export type WalletResponse =
  | { type: "wallet.accounts"; ok: true; accounts: WalletAccount[] }
  | { type: "wallet.accounts"; ok: false; error: string }
  | { type: "wallet.backup"; ok: true; path: string }
  | { type: "wallet.backup"; ok: false; error: string }
  | {
      type: "wallet.balance";
      ok: true;
      address: string;
      assets: TokenBalance[];
    }
  | { type: "wallet.balance"; ok: false; address: string; error: string };
