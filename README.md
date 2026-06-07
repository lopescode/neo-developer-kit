# Neo Developer Kit

## Build faster on Neo!

The Neo Developer Kit bundles development tools, project templates, deployment
utilities, and blockchain integrations into a single VS Code package.

## Requirements

- VS Code `^1.120.0`.
- Network access to a Neo N3 RPC node (a public node is used by default).

## Features

- **[Test Invoke](docs/test-invoke.md)**

## How it works

Installing the extension adds a **Neo Developer Kit** icon to the Activity Bar.

Click it to open a panel with a **home screen** where you pick a tool.

## Development

- Install dependencies

```sh
yarn install
```

- Type-check, lint, bundle and build CSS

```sh
yarn compile
```

- Rebuild extension, webview and CSS on change

```sh
yarn watch
```

## License

This project is open source and licensed under the
[GNU General Public License v3.0 or later](LICENSE).
