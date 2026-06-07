# Neo Developer Kit

Build faster on Neo. The Neo Developer Kit bundles powerful development tools,
project templates, deployment utilities, and blockchain integrations into a
single VS Code package, helping developers go from idea to production with
minimal friction.

## Features

Once installed, the extension adds a **Neo Developer Kit** icon to the Activity
Bar. Clicking it opens a panel with a **home screen** where you pick a tool.
More tools are on the way (Deploy Contract, Wallet); the first available one is
**Test Invoke**.

#### Test Invoke

Run a **read-only** smart-contract invocation against any Neo N3 node, without
broadcasting a transaction — the equivalent of the JSON-RPC
[`invokefunction`](https://docs.neo.org/docs/en-us/reference/rpc/latest-version/api/invokefunction.html)
method. The fastest way to inspect contract state or test a method while you
develop.

From the home screen, choose **Test Invoke**, then:

1. **RPC endpoint** — pre-filled with a public TestNet node; quick links switch
   between TestNet and MainNet.
2. **Contract hash** — paste the contract script hash (`0x...`) and click
   **Load ABI**. The extension fetches the contract manifest
   ([`getcontractstate`](https://docs.neo.org/docs/en-us/reference/rpc/latest-version/api/getcontractstate.html))
   and populates a **method picker** — no need to type method names.
3. **Method** — pick a method; its parameters render as typed inputs
   automatically (and the return type / `safe` flag are shown).
4. Click **Invoke**.

The panel shows the result inline: a `HALT` (success) or `FAULT` (failure)
status with the gas consumed, followed by the full VM result as formatted JSON.
Your last inputs are remembered between sessions.

#### How to open it

Click the **Neo Developer Kit** icon in the Activity Bar, or run
**Neo: Open Developer Kit** from the Command Palette (`Ctrl+Shift+P` /
`Cmd+Shift+P`).

## Requirements

- VS Code `^1.120.0`.
- Network access to a Neo N3 RPC node (a public node is used by default).

## Programmatic API

The RPC layer is available as a standalone helper:

```ts
import { invokeFunction, DEFAULT_RPC_ENDPOINTS } from "./rpc";

const result = await invokeFunction(
  DEFAULT_RPC_ENDPOINTS.testnet,
  "0xd2a4cff31913016155e38e474a2c06d08be276cf", // GAS contract
  "symbol"
);
// result.state === "HALT", result.stack[0].value === <base64 "GAS">
```

`invokeFunction` throws a descriptive `Error` when the node returns a JSON-RPC
error or an empty result.

## Extension Settings

This extension does not contribute any settings yet.

## Development

```sh
yarn install        # install dependencies
yarn compile        # type-check, lint, bundle (extension + webview) and build CSS
yarn watch          # rebuild extension, webview and CSS on change (use with F5)
yarn test           # run the test suite (Jest)
```

### Architecture

The project has two TypeScript builds, both bundled by esbuild:

- **Extension host** (`src/extension.ts`, Node) — commands and the
  `NeoKitViewProvider`, which serves the panel and brokers RPC calls. Output:
  `dist/extension.js`.
- **Webview** (`src/webview/`, browser) — a **React + TypeScript** app styled
  with **Tailwind CSS**. Output: `media/js/webview.js` (+ `media/css/tailwind.css`).

The webview is a small single-page app:

- `main.tsx` mounts `<App/>`; `router.tsx` is a lightweight screen router whose
  current route is persisted to the webview state.
- `screens/` holds one component per tool (`Home`, `TestInvoke`); add a tool by
  creating a screen and registering it in `App.tsx`.
- `components/` are reusable, themed with VS Code CSS variables (via Tailwind
  arbitrary values like `bg-[var(--vscode-button-background)]`).
- `vscode.ts` wraps `acquireVsCodeApi()` with typed `postMessage`/`onMessage`;
  message shapes live in `messages.ts`.

`getKitHtml` (in `neoKitView.ts`) loads `media/index.html`, rewrites the relative
asset URLs to webview URIs, injects the Content-Security-Policy and the script
nonce. The generated bundles (`media/js/webview.js`, `media/css/tailwind.css`)
are git-ignored and produced by the build.

Tests run on plain Node with [Jest](https://jestjs.io/); the `vscode` module is
resolved to a lightweight mock (`src/test/vscodeMock.ts`), so no extension host
is needed. The suite covers:

- `invokeFunction` / `getContractState` request shaping, success parsing and
  error handling (against a local mock RPC server).
- `parseParams` / `runInvoke` / `loadContractAbi` core: input validation,
  parameter parsing and ABI loading.
- The provider: `getKitHtml` (asset URL rewriting, CSP, nonce) and the
  `buildInvokeResponse` / `buildAbiResponse` message handlers.

## Known Issues

None reported yet. Please file issues for any problems you encounter.

## Release Notes

### 0.0.1

- Initial release: **Test Invoke** command and `invokeFunction` RPC helper.
