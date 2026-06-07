import * as vscode from "vscode";
import { NeoKitViewProvider } from "./webview/NeoKitViewProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      NeoKitViewProvider.viewType,
      new NeoKitViewProvider(context.extensionUri, context.secrets),
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
    vscode.commands.registerCommand("neo.openPanel", () =>
      vscode.commands.executeCommand("neo.kitView.focus"),
    ),
  );
}
