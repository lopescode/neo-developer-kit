import * as vscode from "vscode";
import { experimental, sc, u } from "@cityofzion/neon-js";
import { Rpc } from "../rpc/Rpc";
import { ContractParameter, InvokeResult } from "../rpc/types";
import { Wallet } from "../wallet/Wallet";
import {
  ContractAbi,
  ContractInput,
  ContractMessage,
  ContractResponse,
  DeployInput,
  InvokeInput,
  UpdateInput,
} from "./types";

export class Contract {
  constructor(private readonly wallet: Wallet) {}

  async handle(message: ContractMessage): Promise<ContractResponse> {
    switch (message.type) {
      case "loadAbi":
        return this.runAbi(message);
      case "invoke":
        return this.runInvoke(message);
      case "contract.selectNef":
        return this.selectNef();
      case "contract.selectManifest":
        return this.selectManifest();
      case "contract.deploy":
        return this.runDeploy(message);
      case "contract.update":
        return this.runUpdate(message);
    }
  }

  private async runAbi(message: ContractInput): Promise<ContractResponse> {
    try {
      const abi = await this.loadAbi(message);
      return { type: "abi", ok: true, ...abi };
    } catch (err) {
      return { type: "abi", ok: false, error: this.errorMessage(err) };
    }
  }

  private async runInvoke(message: InvokeInput): Promise<ContractResponse> {
    try {
      const result = await this.invoke(message);
      return { type: "result", ok: true, result };
    } catch (err) {
      return { type: "result", ok: false, error: this.errorMessage(err) };
    }
  }

  private async runDeploy(input: DeployInput): Promise<ContractResponse> {
    try {
      const account = await this.wallet.unlockActive();
      if (!account) {
        return { type: "contract.deployed", ok: false, error: "Cancelled." };
      }
      const { nef, manifest } = this.parseContract(input);
      const networkMagic = await this.networkMagic(input.rpc);
      const contractHash = experimental.getContractHash(
        u.HexString.fromHex(account.scriptHash),
        nef.checksum,
        manifest.name,
      );
      const txid = await experimental.deployContract(nef, manifest, {
        networkMagic,
        rpcAddress: input.rpc.trim(),
        account,
      });
      return {
        type: "contract.deployed",
        ok: true,
        txid,
        contractHash: `0x${contractHash}`,
      };
    } catch (err) {
      return {
        type: "contract.deployed",
        ok: false,
        error: this.errorMessage(err),
      };
    }
  }

  private async runUpdate(input: UpdateInput): Promise<ContractResponse> {
    try {
      if (!input.contract?.trim()) {
        throw new Error("Contract hash is required.");
      }
      const account = await this.wallet.unlockActive();
      if (!account) {
        return { type: "contract.updated", ok: false, error: "Cancelled." };
      }
      const { nef, manifest } = this.parseContract(input);
      const networkMagic = await this.networkMagic(input.rpc);
      const target = new experimental.SmartContract(
        u.HexString.fromHex(input.contract.trim().replace(/^0x/, "")),
        { networkMagic, rpcAddress: input.rpc.trim(), account },
      );
      const txid = await target.invoke("update", [
        sc.ContractParam.byteArray(nef.serialize()),
        sc.ContractParam.string(JSON.stringify(manifest.toJson())),
      ]);
      return { type: "contract.updated", ok: true, txid };
    } catch (err) {
      return {
        type: "contract.updated",
        ok: false,
        error: this.errorMessage(err),
      };
    }
  }

  private async selectNef(): Promise<ContractResponse> {
    try {
      const picked = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: "Select NEF",
        filters: { "Neo contract": ["nef"] },
      });
      const uri = picked?.[0];
      if (!uri) {
        return { type: "contract.nef", ok: true };
      }
      const bytes = await vscode.workspace.fs.readFile(uri);
      const nefBase64 = Buffer.from(bytes).toString("base64");
      const nefName = this.basename(uri.path);
      const sibling = uri.with({
        path: uri.path.replace(/\.nef$/i, ".manifest.json"),
      });
      const manifest = await this.tryReadText(sibling);
      return {
        type: "contract.nef",
        ok: true,
        nefName,
        nefBase64,
        manifestName: manifest ? this.basename(sibling.path) : undefined,
        manifestJson: manifest,
      };
    } catch (err) {
      return { type: "contract.nef", ok: false, error: this.errorMessage(err) };
    }
  }

  private async selectManifest(): Promise<ContractResponse> {
    try {
      const picked = await vscode.window.showOpenDialog({
        canSelectMany: false,
        openLabel: "Select manifest",
        filters: { "Contract manifest": ["json"] },
      });
      const uri = picked?.[0];
      if (!uri) {
        return { type: "contract.manifest", ok: true };
      }
      const bytes = await vscode.workspace.fs.readFile(uri);
      return {
        type: "contract.manifest",
        ok: true,
        manifestName: this.basename(uri.path),
        manifestJson: Buffer.from(bytes).toString("utf8"),
      };
    } catch (err) {
      return {
        type: "contract.manifest",
        ok: false,
        error: this.errorMessage(err),
      };
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

  private parseContract(input: DeployInput): {
    nef: ReturnType<typeof sc.NEF.fromBuffer>;
    manifest: InstanceType<typeof sc.ContractManifest>;
  } {
    if (!input.rpc?.trim()) {
      throw new Error("RPC endpoint is required.");
    }
    if (!input.nefBase64) {
      throw new Error("A .nef file is required.");
    }
    if (!input.manifestJson) {
      throw new Error("A manifest is required.");
    }
    let nef: ReturnType<typeof sc.NEF.fromBuffer>;
    try {
      nef = sc.NEF.fromBuffer(Buffer.from(input.nefBase64, "base64"));
    } catch {
      throw new Error("The selected file is not a valid NEF.");
    }
    let manifest: InstanceType<typeof sc.ContractManifest>;
    try {
      manifest = sc.ContractManifest.fromJson(JSON.parse(input.manifestJson));
    } catch {
      throw new Error("The manifest is not valid JSON.");
    }
    return { nef, manifest };
  }

  private async networkMagic(rpc: string): Promise<number> {
    const version = await new Rpc(rpc.trim()).getVersion();
    return version.protocol.network;
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

  private async tryReadText(uri: vscode.Uri): Promise<string | undefined> {
    try {
      const bytes = await vscode.workspace.fs.readFile(uri);
      return Buffer.from(bytes).toString("utf8");
    } catch {
      return undefined;
    }
  }

  private basename(path: string): string {
    return path.split("/").pop() ?? path;
  }

  private errorMessage(err: unknown): string {
    return err instanceof Error ? err.message : String(err);
  }
}
