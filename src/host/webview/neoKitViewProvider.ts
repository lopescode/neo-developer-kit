import * as vscode from "vscode";
import { Contract } from "../contract/Contract";
import { ContractMessage, ContractResponse } from "../contract/types";
import { Wallet } from "../wallet/Wallet";
import { WalletMessage, WalletResponse } from "../wallet/types";
import { getKitHtml, getNonce } from "./webviewHtml";

export class NeoKitViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "neo.kitView";

  private readonly wallet: Wallet;
  private readonly contract = new Contract();

  constructor(
    private readonly extensionUri: vscode.Uri,
    secrets: vscode.SecretStorage,
  ) {
    this.wallet = new Wallet(secrets);
  }

  resolveWebviewView(webviewView: vscode.WebviewView): void {
    const webview = webviewView.webview;

    webview.options = {
      enableScripts: true,
      localResourceRoots: [this.extensionUri],
    };

    const baseUri = webview
      .asWebviewUri(vscode.Uri.joinPath(this.extensionUri, "media"))
      .toString();

    webview.html = getKitHtml(
      this.extensionUri.fsPath,
      webview.cspSource,
      getNonce(),
      baseUri,
    );

    webview.onDidReceiveMessage(async (message) => {
      const reply = await this.route(message);

      if (reply) {
        await webview.postMessage(reply);
      }
    });
  }

  private route(
    message: unknown,
  ): Promise<WalletResponse | ContractResponse> | undefined {
    if (!message || typeof message !== "object") {
      return undefined;
    }

    const type = (message as { type?: unknown }).type;
    if (typeof type !== "string") {
      return undefined;
    }

    if (type.startsWith("wallet.")) {
      return this.wallet.handle(message as WalletMessage);
    }

    if (type === "loadAbi" || type === "invoke") {
      return this.contract.handle(message as ContractMessage);
    }

    return undefined;
  }
}
