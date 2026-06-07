import * as vscode from "vscode";
import { NeoKitViewProvider } from "./webview/neoKitViewProvider";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      NeoKitViewProvider.viewType,
      new NeoKitViewProvider(context.extensionUri),
      { webviewOptions: { retainContextWhenHidden: true } },
    ),
    // The command reveals the Neo Developer Kit panel.
    vscode.commands.registerCommand("neo.openPanel", () =>
      vscode.commands.executeCommand("neo.kitView.focus"),
    ),
  );
}
