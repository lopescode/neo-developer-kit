import * as fs from "fs";
import * as path from "path";

export function getNonce(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let text = "";
  for (let i = 0; i < 32; i++) {
    text += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return text;
}

export function getKitHtml(
  extensionRoot: string,
  cspSource: string,
  nonce: string,
  baseUri: string,
): string {
  let html = fs.readFileSync(
    path.join(extensionRoot, "media", "index.html"),
    "utf8",
  );

  html = html.replace(
    /\b(src|href)="\.\/([^"]+)"/g,
    (_match, attr, rest) => `${attr}="${baseUri}/${rest}"`,
  );

  html = html.replace(/<script\b/g, `<script nonce="${nonce}"`);

  const csp =
    `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; ` +
    `style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}';" />`;

  return html.replace("</head>", `    ${csp}\n  </head>`);
}
