import { ContractAbi } from "../invoke";

/** Message posted back to the webview after an invoke request. */
export type InvokeResponse =
  | { type: "result"; ok: true; result: unknown }
  | { type: "result"; ok: false; error: string };

/** Message posted back to the webview after a load-ABI request. */
export type AbiResponse =
  | ({ type: "abi"; ok: true } & ContractAbi)
  | { type: "abi"; ok: false; error: string };
