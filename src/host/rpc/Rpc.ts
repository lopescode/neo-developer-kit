import axios from "axios";
import {
  ContractParameter,
  ContractState,
  InvokeResult,
  Nep17Balances,
} from "./types";

export class Rpc {
  constructor(private readonly endpoint: string) {}

  invokeFunction(
    contractHash: string,
    method: string,
    params: ContractParameter[] = [],
  ): Promise<InvokeResult> {
    return this.call<InvokeResult>("invokefunction", [
      contractHash,
      method,
      params,
    ]);
  }

  getContractState(contractHash: string): Promise<ContractState> {
    return this.call<ContractState>("getcontractstate", [contractHash]);
  }

  getNep17Balances(address: string): Promise<Nep17Balances> {
    return this.call<Nep17Balances>("getnep17balances", [address]);
  }

  private async call<T>(method: string, params: unknown[]): Promise<T> {
    const { data } = await axios.post(this.endpoint, {
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
}
