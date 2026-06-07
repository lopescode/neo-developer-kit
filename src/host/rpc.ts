import axios from "axios";

export { DEFAULT_RPC_ENDPOINTS } from "../shared/networks";

/**
 * Shape of a Neo `invokefunction` result (the `result` field of the JSON-RPC
 * response). Only the fields we commonly read are typed; the rest are kept open.
 */
export interface InvokeResult {
  script: string;
  state: string;
  gasconsumed: string;
  exception: string | null;
  stack: Array<{ type: string; value?: unknown }>;
  [key: string]: unknown;
}

/**
 * A single parameter for a contract invocation, following the Neo
 * `ContractParameter` JSON shape, e.g. `{ type: "Hash160", value: "0x..." }`.
 */
export interface ContractParameter {
  type: string;
  value?: unknown;
}

/** A parameter definition of a method in a contract ABI. */
export interface ContractMethodParam {
  name: string;
  type: string;
}

/** A method declared in a contract ABI. */
export interface ContractMethod {
  name: string;
  parameters: ContractMethodParam[];
  returntype: string;
  safe: boolean;
  offset?: number;
}

/** The manifest of a deployed contract (subset we use). */
export interface ContractManifest {
  name: string;
  abi: {
    methods: ContractMethod[];
    events: unknown[];
  };
  [key: string]: unknown;
}

/** The result of `getcontractstate` (subset we use). */
export interface ContractState {
  id: number;
  hash: string;
  manifest: ContractManifest;
  [key: string]: unknown;
}

/** Sends a JSON-RPC request and unwraps `result`, throwing on errors. */
async function rpcCall<T>(
  rpc: string,
  method: string,
  params: unknown[],
): Promise<T> {
  const { data } = await axios.post(rpc, {
    jsonrpc: "2.0",
    id: 1,
    method,
    params,
  });

  if (data.error) {
    const { code, message } = data.error;
    throw new Error(`Neo RPC error ${code}: ${message}`);
  }

  if (!data.result) {
    throw new Error("Neo RPC returned an empty result");
  }

  return data.result as T;
}

/**
 * Invokes a smart contract method on a Neo node via the JSON-RPC
 * `invokefunction` method. This is a read-only / test invocation: it runs the
 * script in the VM and returns the result without broadcasting a transaction.
 *
 * @param rpc          The RPC endpoint URL (e.g. a public Neo N3 node).
 * @param contractHash The script hash of the contract (`0x...`).
 * @param method       The contract method to invoke.
 * @param params       The method parameters as Neo contract parameters.
 * @returns            The `result` object returned by the node.
 * @throws             If the request fails or the node returns a JSON-RPC error.
 */
export async function invokeFunction(
  rpc: string,
  contractHash: string,
  method: string,
  params: ContractParameter[] = [],
): Promise<InvokeResult> {
  return rpcCall<InvokeResult>(rpc, "invokefunction", [
    contractHash,
    method,
    params,
  ]);
}

/**
 * Fetches the on-chain state of a contract (including its manifest/ABI) via the
 * JSON-RPC `getcontractstate` method.
 *
 * @param rpc          The RPC endpoint URL.
 * @param contractHash The script hash of the contract (`0x...`).
 * @returns            The contract state, including the manifest and ABI.
 * @throws             If the request fails or the node returns a JSON-RPC error.
 */
export async function getContractState(
  rpc: string,
  contractHash: string,
): Promise<ContractState> {
  return rpcCall<ContractState>(rpc, "getcontractstate", [contractHash]);
}
