import {
  ContractInput,
  InvokeInput,
  loadContractAbi,
  runInvoke,
} from "../invoke";
import { AbiResponse, InvokeResponse } from "./messages";

/** Runs an invocation and shapes the outcome for the webview. Never throws. */
export async function buildInvokeResponse(
  input: InvokeInput
): Promise<InvokeResponse> {
  try {
    const result = await runInvoke(input);
    return { type: "result", ok: true, result };
  } catch (err) {
    return {
      type: "result",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/** Loads a contract ABI and shapes the outcome for the webview. Never throws. */
export async function buildAbiResponse(
  input: ContractInput
): Promise<AbiResponse> {
  try {
    const abi = await loadContractAbi(input);
    return { type: "abi", ok: true, ...abi };
  } catch (err) {
    return {
      type: "abi",
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
