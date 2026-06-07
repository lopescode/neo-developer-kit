import * as fs from "fs";
import * as path from "path";

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
