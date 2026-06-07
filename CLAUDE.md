# Neo Developer Kit — Project Conventions

VS Code extension for Neo N3 development. A webview UI (`src/renderer`, React)
talks to the extension host (`src/host`) over `postMessage`. Shared message
types are mirrored on both sides.

## Adding a feature — required steps

Every new user-facing feature MUST ship with its documentation. When you add one:

1. **Write `docs/<feature>.md`** following the style of existing docs
   (`docs/test-invoke.md`, `docs/wallet.md`): an `# Title`, a 1–2 line
   description, then a `## Usage` section with concrete steps.
2. **Reference it in `README.md`** under the `## Features` list, matching the
   existing pattern: `- **[Feature](docs/feature.md)**`.
3. **Only document enabled features.** If a tool/action is still
   `enabled: false` in the UI (e.g. an entry in `Home.tsx` `TOOLS` or a
   `WalletHub.tsx` `ACTIONS`), do NOT add its doc yet. When it's flipped to
   `enabled: true`, add the doc and the README line in the same change.

Keep docs in the same voice as the existing ones: short, task-focused, no
filler.

## Host code structure (`src/host`)

- One **folder per domain** (`contract/`, `rpc/`, `wallet/`, …).
- Inside each folder: a **PascalCase class file** holding only the class
  (`Contract.ts`), and a **`types.ts`** holding that domain's interfaces and
  type aliases. The class file imports its types from `./types`.
- Each domain class exposes a single **`handle(message)` dispatcher** as its
  public entry point.
- Implementation constants and data (e.g. `WALLET_SECRET_KEY`, `NATIVE_TOKENS`)
  stay in the class file — `types.ts` is for types only.
- **No comments** in host class files; keep the code self-explanatory.

## Message types

Host and renderer keep their own copies of the message/response types
(`src/host/<domain>/types.ts` and `src/renderer/messages.ts`). When you change a
message shape on one side, update the other to match.

## Verify before finishing

Type-check after changes:

```sh
npx tsc --noEmit -p .
```
