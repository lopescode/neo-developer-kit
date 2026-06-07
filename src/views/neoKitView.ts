import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";
import {
  ContractAbi,
  ContractInput,
  InvokeInput,
  loadContractAbi,
  runInvoke,
} from "../invoke";

/** Message posted back to the webview after an invoke request. */
export type InvokeResponse =
  | { type: "result"; ok: true; result: unknown }
  | { type: "result"; ok: false; error: string };

/** Message posted back to the webview after a load-ABI request. */
export type AbiResponse =
  | ({ type: "abi"; ok: true } & ContractAbi)
  | { type: "abi"; ok: false; error: string };

/** Runs an invocation and shapes the outcome for the webview. Never throws. */
export async function buildInvokeResponse(
  input: InvokeInput
): Promise<InvokeResponse> {
  try {
    const result = await runInvoke(input);
    return { type: "result", ok: true, result };
  } catch (err) {
    return {
      type: "result",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Loads a contract ABI and shapes the outcome for the webview. Never throws. */
export async function buildAbiResponse(
  input: ContractInput
): Promise<AbiResponse> {
  try {
    const abi = await loadContractAbi(input);
    return { type: "abi", ok: true, ...abi };
  } catch (err) {
    return {
      type: "abi",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Generates a random nonce used to allow the inline webview script via CSP. */
export function getNonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

/**
 * Loads the panel HTML (`media/index.html`) and makes it webview-ready: relative
 * `./` asset URLs (the React bundle + Tailwind CSS) are rewritten to webview
 * URIs, scripts get the CSP nonce, and a Content-Security-Policy is injected.
 * The HTML stays a plain document so it can be edited (and even previewed in a
 * normal browser) without templating noise.
 *
 * @param extensionRoot Filesystem path to the extension root.
 * @param cspSource     The webview's `cspSource`.
 * @param nonce         A per-load nonce allowing the script tags.
 * @param baseUri       Webview URI of the `media` folder (no trailing slash).
 */
export function getKitHtml(
  extensionRoot: string,
  cspSource: string,
  nonce: string,
  baseUri: string
): string {
  let html = fs.readFileSync(
    path.join(extensionRoot, "media", "index.html"),
    "utf8"
  );

  // Rewrite relative asset URLs (e.g. ./js/webview.js) to webview URIs.
  html = html.replace(
    /\b(src|href)="\.\/([^"]+)"/g,
    (_match, attr, rest) => `${attr}="${baseUri}/${rest}"`
  );
  // Allow the (otherwise blocked) script bundle to run via the nonce.
  html = html.replace(/<script\b/g, `<script nonce="${nonce}"`);

  const csp =
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; ` +
    `style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />`;
  return html.replace("</head>", `    ${csp}\n  </head>`);
}

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
