import { Rpc } from "../rpc/Rpc";
import { ContractParameter, InvokeResult } from "../rpc/types";
import {
  ContractAbi,
  ContractInput,
  ContractMessage,
  ContractResponse,
  InvokeInput,
} from "./types";

export class Contract {
  async handle(message: ContractMessage): Promise<ContractResponse> {
    if (message.type === "loadAbi") {
      try {
        const abi = await this.loadAbi(message);

        return { type: "abi", ok: true, ...abi };
      } catch (err) {
        return { type: "abi", ok: false, error: this.errorMessage(err) };
      }
    }

    try {
      const result = await this.invoke(message);

      return { type: "result", ok: true, result };
    } catch (err) {
      return { type: "result", ok: false, error: this.errorMessage(err) };
    }
  }

  async invoke(input: InvokeInput): Promise<InvokeResult> {
    if (!input.rpc?.trim()) {
      throw new Error("RPC endpoint is required.");
    }

    if (!input.contract?.trim()) {
      throw new Error("Contract hash is required.");
    }

    if (!input.method?.trim()) {
      throw new Error("Method name is required.");
    }

    const params = this.parseParams(input.params);

    return new Rpc(input.rpc.trim()).invokeFunction(
      input.contract.trim(),
      input.method.trim(),
      params,
    );
  }

  async loadAbi(input: ContractInput): Promise<ContractAbi> {
    if (!input.rpc?.trim()) {
      throw new Error("RPC endpoint is required.");
    }

    if (!input.contract?.trim()) {
      throw new Error("Contract hash is required.");
    }

    const state = await new Rpc(input.rpc.trim()).getContractState(
      input.contract.trim(),
    );

    const methods = [...(state.manifest.abi.methods ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    return { name: state.manifest.name, hash: state.hash, methods };
  }

  private parseParams(raw: string | undefined): ContractParameter[] {
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

  private errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }
}
