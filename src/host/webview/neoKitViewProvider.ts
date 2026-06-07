import * as vscode from "vscode";
import { ContractInput, InvokeInput } from "../invoke";
import { buildAbiResponse, buildInvokeResponse } from "./messageHandlers";
import { getKitHtml, getNonce } from "./webviewHtml";

/**
 * Provides the Neo Developer Kit webview shown in the side panel.
 */
export class NeoKitViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = "neo.kitView";

  constructor(private readonly extensionUri: vscode.Uri) {}

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
      baseUri
    );

    webview.onDidReceiveMessage(async (message) => {
      if (!message) {
        return;
      }
      if (message.type === "loadAbi") {
        await webview.postMessage(await buildAbiResponse(message as ContractInput));
      } else if (message.type === "invoke") {
        await webview.postMessage(await buildInvokeResponse(message as InvokeInput));
      }
    });
  }
}
