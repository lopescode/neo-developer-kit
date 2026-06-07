# Host

The **extension host** — the Node code VS Code runs when the extension
activates.

It registers the panel and holds the blockchain logic. It never touches the
DOM; the UI lives in [`../renderer`](../renderer).

## Layout

Files that export a class are named in `PascalCase` (`Rpc.ts`, `Contract.ts`,
`Wallet.ts`); plain-function modules stay lowercase (`extension.ts`).

- `extension.ts` — entry point; `activate()` registers the view and commands.
- `Rpc.ts` — the `Rpc` class: low-level JSON-RPC calls to a Neo N3 node (bound to
  one endpoint).
- `Contract.ts` — the `Contract` class: contract tool logic on top of `Rpc` (run
  an invoke, load an ABI) and its `handle` dispatcher.
- `Wallet.ts` — the `Wallet` class: account management (NEP-6/NEP-2), NEP-17
  balance display, and its `handle` dispatcher. Owns everything wallet-related.
- `webview/` — the host side of the panel: HTML + message routing.

## Add a new tool

1. Add the logic to the domain class that owns it (`Contract` for contract calls,
   `Wallet` for wallet actions, or a new class), using `Rpc` for node calls.
2. Add a case to that class's `handle` dispatcher and route the message type in
   `webview/NeoKitViewProvider.ts` — see [`webview/`](webview).
3. Build the matching screen in [`../renderer`](../renderer) — see its README.

Keep node calls in `Rpc`, each domain's logic + message handling in its own
class, and only the routing in `webview/`.
