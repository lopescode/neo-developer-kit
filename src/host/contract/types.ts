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

export interface DeployInput {
  rpc: string;
  nefBase64: string;
  manifestJson: string;
}

export interface UpdateInput extends DeployInput {
  contract: string;
}

export type ContractMessage =
  | ({ type: "loadAbi" } & ContractInput)
  | ({ type: "invoke" } & InvokeInput)
  | { type: "contract.selectNef" }
  | { type: "contract.selectManifest" }
  | ({ type: "contract.deploy" } & DeployInput)
  | ({ type: "contract.update" } & UpdateInput);

export type ContractResponse =
  | ({ type: "abi"; ok: true } & ContractAbi)
  | { type: "abi"; ok: false; error: string }
  | { type: "result"; ok: true; result: InvokeResult }
  | { type: "result"; ok: false; error: string }
  | {
      type: "contract.nef";
      ok: true;
      nefName?: string;
      nefBase64?: string;
      manifestName?: string;
      manifestJson?: string;
    }
  | { type: "contract.nef"; ok: false; error: string }
  | {
      type: "contract.manifest";
      ok: true;
      manifestName?: string;
      manifestJson?: string;
    }
  | { type: "contract.manifest"; ok: false; error: string }
  | { type: "contract.deployed"; ok: true; txid: string; contractHash: string }
  | { type: "contract.deployed"; ok: false; error: string }
  | { type: "contract.updated"; ok: true; txid: string }
  | { type: "contract.updated"; ok: false; error: string };
