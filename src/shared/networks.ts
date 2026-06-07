/**
 * Built-in public Neo N3 RPC endpoints, grouped by network.
 *
 * Each network holds a *list* of endpoints. The first entry is used by default;
 * the extras exist for redundancy/failover — if a node is unreachable at the
 * moment, the next one in the list can be tried. Lives in `shared` (no
 * dependencies) so both the extension host and the webview bundle can import it.
 */

/** Networks with built-in, curated endpoints (everything else is `custom`). */
export type BuiltInNetwork = "testnet" | "mainnet";

/** A network the user can pick in the UI. */
export type NetworkId = BuiltInNetwork | "custom";

export const RPC_ENDPOINTS: Record<BuiltInNetwork, string[]> = {
  mainnet: ["https://mainnet1.neo.coz.io:443"],
  testnet: ["https://testnet1.neo.coz.io:443"],
};

/** The primary (default) endpoint for a built-in network. */
export function primaryEndpoint(network: BuiltInNetwork): string {
  return RPC_ENDPOINTS[network][0];
}

/**
 * Back-compat alias: the single default endpoint per built-in network.
 * @deprecated Prefer {@link RPC_ENDPOINTS} / {@link primaryEndpoint}.
 */
export const DEFAULT_RPC_ENDPOINTS = {
  mainnet: primaryEndpoint("mainnet"),
  testnet: primaryEndpoint("testnet"),
};
