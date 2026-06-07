# Renderer

The **UI that runs inside the webview** — a small React app rendered in the Neo
Developer Kit panel.

It draws the screens and talks to the extension host by
sending and receiving messages.

It pairs with [`../host/webview`](../host/webview), the host side that hosts this
app and answers its messages.

## Layout

- `main.tsx` — entry point; mounts `<App />`.
- `App.tsx` — maps a route name to a screen.
- `router.tsx` — minimal router; remembers the current screen.
- `screens/` — one file per screen.
- `components/` — reusable UI bits (Button, Field, …).
- `vscode.ts` — `postMessage` / `onMessage` to talk to the host.
- `messages.ts` — the message types exchanged with the host.

## Add a new screen

1. Create `screens/MyTool.tsx` exporting a component.
2. Register it in `App.tsx`:

   ```tsx
   const SCREENS = { home: Home, invoke: TestInvoke, myTool: MyTool };
   ```

3. Navigate to it from anywhere:

   ```tsx
   const { navigate } = useRouter();
   navigate("myTool");
   ```

## Talk to the extension host

Send a request, listen for the reply — both typed in `messages.ts`:

```tsx
postMessage({ type: "invoke" /* … */ });
onMessage((msg) => {
  if (msg.type === "result") {
    /* … */
  }
});
```

The matching handler lives in [`../host/webview`](../host/webview).
