import {
  ContractMethod,
  ContractParameter,
  getContractState,
  InvokeResult,
  invokeFunction,
} from "./rpc";

/**
 * Parses the raw params input (a JSON array string) into contract parameters.
 * An empty/whitespace string is treated as no parameters.
 *
 * @throws if the input is not a JSON array of contract parameters.
 */
export function parseParams(raw: string | undefined): ContractParameter[] {
  if (!raw || !raw.trim()) {
    return [];
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("Parameters must be valid JSON.");
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      'Parameters must be a JSON array, e.g. [{"type":"Integer","value":"1"}].',
    );
  }

  return parsed as ContractParameter[];
}

/** Raw invocation request coming from the UI. */
export interface InvokeInput {
  rpc: string;
  contract: string;
  method: string;
  /** Raw JSON string for the parameters (optional). */
  params?: string;
}

/**
 * Validates an {@link InvokeInput} and performs a read-only `invokefunction`
 * call. This is UI-agnostic so it can be driven by a webview, a command, or a
 * test.
 *
 * @throws with a user-friendly message on missing/invalid input or RPC failure.
 */
export async function runInvoke(input: InvokeInput): Promise<InvokeResult> {
  if (!input.rpc || !input.rpc.trim()) {
    throw new Error("RPC endpoint is required.");
  }
  if (!input.contract || !input.contract.trim()) {
    throw new Error("Contract hash is required.");
  }
  if (!input.method || !input.method.trim()) {
    throw new Error("Method name is required.");
  }

  const params = parseParams(input.params);
  return invokeFunction(
    input.rpc.trim(),
    input.contract.trim(),
    input.method.trim(),
    params,
  );
}

/** A request to load a contract's ABI. */
export interface ContractInput {
  rpc: string;
  contract: string;
}

/** The ABI info surfaced to the UI for a loaded contract. */
export interface ContractAbi {
  name: string;
  hash: string;
  methods: ContractMethod[];
}

/**
 * Loads a contract's manifest and returns its name, hash and ABI methods
 * (sorted by name) so the UI can offer a method picker instead of free text.
 *
 * @throws with a user-friendly message on missing input or RPC failure.
 */
export async function loadContractAbi(
  input: ContractInput,
): Promise<ContractAbi> {
  if (!input.rpc || !input.rpc.trim()) {
    throw new Error("RPC endpoint is required.");
  }
  if (!input.contract || !input.contract.trim()) {
    throw new Error("Contract hash is required.");
  }

  const state = await getContractState(input.rpc.trim(), input.contract.trim());
  const methods = [...(state.manifest.abi.methods ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name),
  );

  return { name: state.manifest.name, hash: state.hash, methods };
}
