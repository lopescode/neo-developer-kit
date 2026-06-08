import { useEffect, useState } from "react";
import { useRouter } from "../../router";
import { onMessage, postMessage } from "../../vscode";
import type { ExtensionMessage } from "../../messages";
import { resolveEndpoint, type NetworkId } from "../../../shared/networks";
import { Button } from "../../components/Button";
import { TextInput } from "../../components/TextInput";
import { Field } from "../../components/Field";
import { NetworkSelect } from "../../components/NetworkSelect";
import { Status } from "../../components/Status";
import type { StatusValue } from "../../components/Status";
import { useContractFiles } from "./useContractFiles";
import { ContractFilePicker } from "./ContractFilePicker";

export function UpdateContract() {
  const { navigate } = useRouter();
  const { files, error, selectNef, selectManifest } = useContractFiles();

  const [network, setNetwork] = useState<NetworkId>("testnet");
  const [customRpc, setCustomRpc] = useState("");
  const [contract, setContract] = useState("");
  const [status, setStatus] = useState<StatusValue>({ text: "", kind: "" });
  const [txid, setTxid] = useState<string | null>(null);

  const rpc = resolveEndpoint(network, customRpc);
  const ready = Boolean(
    files.nefBase64 && files.manifestJson && contract.trim(),
  );

  function update() {
    if (!ready) {
      return;
    }
    setTxid(null);
    setStatus({ text: "Updating… confirm the password prompt.", kind: "pending" });
    postMessage({
      type: "contract.update",
      rpc: rpc.trim(),
      contract: contract.trim(),
      nefBase64: files.nefBase64!,
      manifestJson: files.manifestJson!,
    });
  }

  useEffect(() => {
    return onMessage((msg: ExtensionMessage) => {
      if (msg.type !== "contract.updated") {
        return;
      }
      if (!msg.ok) {
        setStatus({ text: "✖ " + msg.error, kind: "error" });
        return;
      }
      setStatus({ text: "✔ Updated — script hash unchanged", kind: "ok" });
      setTxid(msg.txid);
    });
  }, []);

  return (
    <section>
      <button
        onClick={() => navigate("contract")}
        className="mb-2.5 text-[var(--vscode-textLink-foreground)] text-xs hover:underline"
      >
        ← Manage Contract
      </button>

      <h3 className="font-semibold text-sm">Update</h3>
      <p className="opacity-70 mb-1 text-xs">
        Replace a deployed contract's code in place. The script hash stays the
        same; the contract must expose an <code>update</code> method.
      </p>

      <NetworkSelect
        network={network}
        onNetworkChange={setNetwork}
        customRpc={customRpc}
        onCustomRpcChange={setCustomRpc}
      />

      <Field label="Contract hash">
        <TextInput
          value={contract}
          placeholder="0x..."
          onChange={(e) => setContract(e.target.value)}
        />
      </Field>

      <ContractFilePicker
        nefName={files.nefName}
        manifestName={files.manifestName}
        onSelectNef={selectNef}
        onSelectManifest={selectManifest}
      />

      {error && (
        <p className="mt-2 text-[var(--vscode-errorForeground)] text-xs">
          ✖ {error}
        </p>
      )}

      <Button className="mt-3.5 w-full" disabled={!ready} onClick={update}>
        Update
      </Button>

      <Status value={status} />

      {txid && (
        <div className="bg-[var(--vscode-textCodeBlock-background,rgba(127,127,127,0.1))] mt-1 p-2 rounded text-[0.82em] break-all">
          <span className="opacity-70">tx</span> {txid}
        </div>
      )}
    </section>
  );
}
