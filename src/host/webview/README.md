# Webview (host side)

The **extension-host code that backs the panel**. It runs in Node (not the
browser), builds the panel's HTML, and answers the messages the UI sends.

It pairs with [`../../renderer`](../../renderer), the React app that runs *inside*
the webview.

## Layout

- `neoKitViewProvider.ts` — registers the view, loads the HTML, routes messages.
- `webviewHtml.ts` — builds the panel HTML (asset URLs, CSP, nonce).
- `messageHandlers.ts` — turns a request into a reply; never throws.
- `messages.ts` — the reply types sent back to the renderer.

## Add a new message

When the renderer sends a new request type, answer it here:

1. Write a handler in `messageHandlers.ts` that returns a reply object:

   ```ts
   export async function buildMyResponse(input: MyInput): Promise<MyResponse> {
     try { return { type: "myReply", ok: true, /* … */ }; }
     catch (err) { return { type: "myReply", ok: false, error: String(err) }; }
   }
   ```

2. Add the reply type in `messages.ts` (and mirror it in
   [`../../renderer/messages.ts`](../../renderer/messages.ts)).
3. Route it in `neoKitViewProvider.ts`:

   ```ts
   if (message.type === "myRequest") {
     await webview.postMessage(await buildMyResponse(message));
   }
   ```

Keep the actual blockchain logic in `../invoke.ts` / `../rpc.ts` — handlers only
shape the result for the UI.
