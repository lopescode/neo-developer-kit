# Host

The **extension host** — the Node code VS Code runs when the extension
activates.

It registers the panel and holds the blockchain logic. It never touches the
DOM; the UI lives in [`../renderer`](../renderer).

## Layout

- `extension.ts` — entry point; `activate()` registers the view and commands.
- `rpc.ts` — low-level JSON-RPC calls to a Neo N3 node.
- `invoke.ts` — the tool logic built on top of `rpc.ts` (run an invoke, load an ABI).
- `webview/` — the host side of the panel: HTML + message handling.

## Add a new tool

1. Add the logic in `invoke.ts` (or a new file next to it), using `rpc.ts` for
   node calls.
2. Expose it to the UI by adding a message handler in
   [`webview/`](webview) — see its README.
3. Build the matching screen in [`../renderer`](../renderer) — see its README.

Keep node calls in `rpc.ts`, tool logic in `invoke.ts`, and the webview wiring in
`webview/`.
