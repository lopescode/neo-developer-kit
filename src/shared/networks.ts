/**
 * Default public Neo N3 RPC endpoints. Lives in `shared` (no dependencies) so
 * both the extension host and the webview bundle can import it.
 */
export const DEFAULT_RPC_ENDPOINTS = {
  mainnet: "https://mainnet1.neo.coz.io:443",
  testnet: "https://testnet1.neo.coz.io:443",
};
