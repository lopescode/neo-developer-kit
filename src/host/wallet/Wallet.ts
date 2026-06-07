import * as vscode from "vscode";
import { wallet } from "@cityofzion/neon-js";
import { Rpc } from "../rpc/Rpc";
import { TokenBalance, WalletAccount, WalletMessage, WalletResponse } from "./types";

type Nep6Wallet = InstanceType<typeof wallet.Wallet>;
type Account = InstanceType<typeof wallet.Account>;

const WALLET_SECRET_KEY = "neo.wallet.nep6";

const NATIVE_TOKENS: Record<string, { symbol: string; decimals: number }> = {
  "0xef4073a0f2b305a38ec4050e4d3d28bc40ea63f5": { symbol: "NEO", decimals: 0 },
  "0xd2a4cff31913016155e38e474a2c06d08be276cf": { symbol: "GAS", decimals: 8 },
};

export class Wallet {
  constructor(private readonly secrets: vscode.SecretStorage) {}

  async handle(message: WalletMessage): Promise<WalletResponse> {
    try {
      switch (message.type) {
        case "wallet.list":
          return await this.accounts();
        case "wallet.create":
          return await this.create();
        case "wallet.import":
          return await this.import();
        case "wallet.setActive":
          return await this.setActive(message.address);
        case "wallet.remove":
          return await this.remove(message.address);
        case "wallet.backup":
          return await this.backup();
        case "wallet.balance":
          return await this.balance(message.rpc, message.address);
      }
    } catch (err) {
      return this.fail(err);
    }
  }

  private async accounts(): Promise<WalletResponse> {
    const accounts = this.toPublic(await this.load());
    return { type: "wallet.accounts", ok: true, accounts };
  }

  private async create(): Promise<WalletResponse> {
    const label = await this.promptLabel();
    if (label === undefined) {
      return this.accounts();
    }
    const password = await this.promptNewPassword();
    if (password === undefined) {
      return this.accounts();
    }
    return this.add(new wallet.Account(), label, password);
  }

  private async import(): Promise<WalletResponse> {
    const secret = await vscode.window.showInputBox({
      password: true,
      ignoreFocusOut: true,
      prompt: "Private key (WIF or hex) to import",
    });
    if (!secret) {
      return this.accounts();
    }
    const trimmed = secret.trim();
    if (!wallet.isWIF(trimmed) && !wallet.isPrivateKey(trimmed)) {
      throw new Error("Not a valid WIF or private key.");
    }
    const label = await this.promptLabel();
    if (label === undefined) {
      return this.accounts();
    }
    const password = await this.promptNewPassword();
    if (password === undefined) {
      return this.accounts();
    }
    return this.add(new wallet.Account(trimmed), label, password);
  }

  private async setActive(address: string): Promise<WalletResponse> {
    const wlt = await this.load();
    const index = wlt.accounts.findIndex((a) => a.address === address);
    if (index === -1) {
      throw new Error(`Account ${address} not found.`);
    }
    wlt.setDefault(index);
    await this.save(wlt);
    return { type: "wallet.accounts", ok: true, accounts: this.toPublic(wlt) };
  }

  private async remove(address: string): Promise<WalletResponse> {
    const choice = await vscode.window.showWarningMessage(
      `Remove ${address} from the wallet? This cannot be undone — make sure you have a backup of its key.`,
      { modal: true },
      "Remove",
    );
    if (choice !== "Remove") {
      return this.accounts();
    }
    const wlt = await this.load();
    const index = wlt.accounts.findIndex((a) => a.address === address);
    if (index === -1) {
      throw new Error(`Account ${address} not found.`);
    }
    const wasActive = wlt.accounts[index].isDefault;
    wlt.accounts.splice(index, 1);
    if (wasActive && wlt.accounts.length > 0) {
      wlt.setDefault(0);
    }
    await this.save(wlt);
    return { type: "wallet.accounts", ok: true, accounts: this.toPublic(wlt) };
  }

  private async balance(rpc: string, address: string): Promise<WalletResponse> {
    try {
      const assets = await this.fetchBalances(rpc, address);
      return { type: "wallet.balance", ok: true, address, assets };
    } catch (err) {
      return {
        type: "wallet.balance",
        ok: false,
        address,
        error: this.errorMessage(err),
      };
    }
  }

  private async backup(): Promise<WalletResponse> {
    const wlt = await this.load();
    if (wlt.accounts.length === 0) {
      return {
        type: "wallet.backup",
        ok: false,
        error: "No accounts to back up.",
      };
    }
    const defaultDir =
      vscode.workspace.workspaceFolders?.[0]?.uri ??
      vscode.Uri.file(process.env.HOME ?? ".");
    const target = await vscode.window.showSaveDialog({
      defaultUri: vscode.Uri.joinPath(defaultDir, "neo-wallet.json"),
      filters: { "NEP-6 wallet": ["json"] },
      saveLabel: "Save wallet backup",
    });
    if (!target) {
      return { type: "wallet.backup", ok: true, path: "" };
    }
    const json = JSON.stringify(wlt.export(), null, 2);
    await vscode.workspace.fs.writeFile(target, Buffer.from(json, "utf8"));
    vscode.window
      .showInformationMessage(
        `Wallet backup saved to ${target.fsPath}`,
        "Reveal in Finder",
      )
      .then((action) => {
        if (action) {
          vscode.commands.executeCommand("revealFileInOS", target);
        }
      });
    return { type: "wallet.backup", ok: true, path: target.fsPath };
  }

  private async add(
    acct: Account,
    label: string,
    password: string,
  ): Promise<WalletResponse> {
    const wlt = await this.load();
    if (wlt.accounts.some((a) => a.address === acct.address)) {
      throw new Error(`Account ${acct.address} is already in the wallet.`);
    }
    acct.label = label;
    await acct.encrypt(password);
    wlt.addAccount(acct);
    if (wlt.accounts.length === 1) {
      wlt.setDefault(0);
    }
    await this.save(wlt);
    return { type: "wallet.accounts", ok: true, accounts: this.toPublic(wlt) };
  }

  private async load(): Promise<Nep6Wallet> {
    const raw = await this.secrets.get(WALLET_SECRET_KEY);
    return raw
      ? new wallet.Wallet(JSON.parse(raw))
      : new wallet.Wallet({ name: "neo-developer-kit" });
  }

  private async save(wlt: Nep6Wallet): Promise<void> {
    await this.secrets.store(WALLET_SECRET_KEY, JSON.stringify(wlt.export()));
  }

  private toPublic(wlt: Nep6Wallet): WalletAccount[] {
    return wlt.accounts.map((acc) => ({
      address: acc.address,
      label: acc.label || acc.address,
      isActive: acc.isDefault,
    }));
  }

  private async fetchBalances(
    rpc: string,
    address: string,
  ): Promise<TokenBalance[]> {
    const { balance } = await new Rpc(rpc).getNep17Balances(address);
    const byHash = new Map(
      balance.map((entry) => [this.normalizeHash(entry.assethash), entry]),
    );
    const result: TokenBalance[] = [];

    for (const [hash, meta] of Object.entries(NATIVE_TOKENS)) {
      const entry = byHash.get(hash);
      result.push({
        symbol: meta.symbol,
        hash,
        trusted: true,
        amount: entry ? this.formatAmount(entry.amount, meta.decimals) : "0",
      });
      byHash.delete(hash);
    }

    for (const [hash, entry] of byHash) {
      const decimals = entry.decimals ? Number(entry.decimals) : 0;
      result.push({
        symbol: entry.symbol || "?",
        hash,
        trusted: false,
        amount: this.formatAmount(entry.amount, decimals),
      });
    }

    return result;
  }

  private normalizeHash(hash: string): string {
    const lower = hash.toLowerCase();
    return lower.startsWith("0x") ? lower : `0x${lower}`;
  }

  private formatAmount(raw: string, decimals: number): string {
    if (decimals <= 0) {
      return raw;
    }
    const negative = raw.startsWith("-");
    const digits = (negative ? raw.slice(1) : raw).padStart(decimals + 1, "0");
    const whole = digits.slice(0, digits.length - decimals);
    const frac = digits.slice(digits.length - decimals).replace(/0+$/, "");
    return `${negative ? "-" : ""}${whole}${frac ? `.${frac}` : ""}`;
  }

  private promptLabel(): Thenable<string | undefined> {
    return vscode.window.showInputBox({
      ignoreFocusOut: true,
      prompt: "Account label (optional)",
      placeHolder: "e.g. dev-testnet",
    });
  }

  private async promptNewPassword(): Promise<string | undefined> {
    const password = await vscode.window.showInputBox({
      password: true,
      ignoreFocusOut: true,
      prompt: "Encryption password for this account",
      validateInput: (v) =>
        v.length < 4 ? "Use at least 4 characters." : undefined,
    });
    if (password === undefined) {
      return undefined;
    }
    const confirm = await vscode.window.showInputBox({
      password: true,
      ignoreFocusOut: true,
      prompt: "Confirm password",
    });
    if (confirm === undefined) {
      return undefined;
    }
    if (password !== confirm) {
      vscode.window.showErrorMessage("Passwords do not match.");
      return undefined;
    }
    return password;
  }

  private fail(err: unknown): WalletResponse {
    return {
      type: "wallet.accounts",
      ok: false,
      error: this.errorMessage(err),
    };
  }

  private errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }
}
