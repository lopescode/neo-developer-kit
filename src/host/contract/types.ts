import { ContractMethod, InvokeResult } from "../rpc/types";

export interface InvokeInput {
  rpc: string;
  contract: string;
  method: string;
  params?: string;
}

export interface ContractInput {
  rpc: string;
  contract: string;
}

export interface ContractAbi {
  name: string;
  hash: string;
  methods: ContractMethod[];
}

export type ContractMessage =
  | ({ type: "loadAbi" } & ContractInput)
  | ({ type: "invoke" } & InvokeInput);

export type ContractResponse =
  | ({ type: "abi"; ok: true } & ContractAbi)
  | { type: "abi"; ok: false; error: string }
  | { type: "result"; ok: true; result: InvokeResult }
  | { type: "result"; ok: false; error: string };
