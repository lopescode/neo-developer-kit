import { useEffect, useState } from "react";
import { useRouter } from "../../router";
import { onMessage, postMessage } from "../../vscode";
import type { ExtensionMessage } from "../../messages";
import { resolveEndpoint, type NetworkId } from "../../../shared/networks";
import { Button } from "../../components/Button";
import { NetworkSelect } from "../../components/NetworkSelect";
import { Status } from "../../components/Status";
import type { StatusValue } from "../../components/Status";
import { useContractFiles } from "./useContractFiles";
import { ContractFilePicker } from "./ContractFilePicker";

export function DeployContract() {
  const { navigate } = useRouter();
  const { files, error, selectNef, selectManifest } = useContractFiles();

  const [network, setNetwork] = useState<NetworkId>("testnet");
  const [customRpc, setCustomRpc] = useState("");
  const [status, setStatus] = useState<StatusValue>({ text: "", kind: "" });
  const [result, setResult] = useState<{ hash: string; txid: string } | null>(
    null,
  );

  const rpc = resolveEndpoint(network, customRpc);
  const ready = Boolean(files.nefBase64 && files.manifestJson);

  function deploy() {
    if (!ready) {
      return;
    }
    setResult(null);
    setStatus({ text: "Deploying… confirm the password prompt.", kind: "pending" });
    postMessage({
      type: "contract.deploy",
      rpc: rpc.trim(),
      nefBase64: files.nefBase64!,
      manifestJson: files.manifestJson!,
    });
  }

  useEffect(() => {
    return onMessage((msg: ExtensionMessage) => {
      if (msg.type !== "contract.deployed") {
        return;
      }
      if (!msg.ok) {
        setStatus({ text: "✖ " + msg.error, kind: "error" });
        return;
      }
      setStatus({ text: "✔ Deployed", kind: "ok" });
      setResult({ hash: msg.contractHash, txid: msg.txid });
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

      <h3 className="font-semibold text-sm">Deploy</h3>
      <p className="opacity-70 mb-1 text-xs">
        Publish a compiled contract. Signed with the active wallet account.
      </p>

      <NetworkSelect
        network={network}
        onNetworkChange={setNetwork}
        customRpc={customRpc}
        onCustomRpcChange={setCustomRpc}
      />

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

      <Button className="mt-3.5 w-full" disabled={!ready} onClick={deploy}>
        Deploy
      </Button>

      <Status value={status} />

      {result && (
        <div className="bg-[var(--vscode-textCodeBlock-background,rgba(127,127,127,0.1))] mt-1 p-2 rounded text-[0.82em] break-all">
          <div>
            <span className="opacity-70">contract</span> {result.hash}
          </div>
          <div className="mt-1">
            <span className="opacity-70">tx</span> {result.txid}
          </div>
        </div>
      )}
    </section>
  );
}
