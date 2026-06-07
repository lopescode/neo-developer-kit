# Webview (host side)

The **extension-host code that backs the panel**. It runs in Node (not the
browser), builds the panel's HTML, and routes the messages the UI sends to the
right domain handler.

It pairs with [`../../renderer`](../../renderer), the React app that runs *inside*
the webview.

## Layout

- `NeoKitViewProvider.ts` — registers the view, loads the HTML, routes each
  message to the domain that owns it (`wallet.*` → `Wallet`, contract calls →
  `handleContractMessage`).
- `webviewHtml.ts` — builds the panel HTML (asset URLs, CSP, nonce).

## Add a new message

Messages are owned by a domain class in [`..`](..), not by the webview:

- Wallet messages live in [`../Wallet.ts`](../Wallet.ts) — add the case in
  `Wallet.handle` and the variant to `WalletMessage` / `WalletResponse`.
- Contract messages live in [`../Contract.ts`](../Contract.ts) — add the case in
  `Contract.handle` and the variant to `ContractMessage` / `ContractResponse`.

Then route the new `type` in `NeoKitViewProvider.route`, and mirror the message /
response shape in [`../../renderer/messages.ts`](../../renderer/messages.ts).
