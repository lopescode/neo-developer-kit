import { useEffect, useState } from "react";
import { onMessage, postMessage } from "../../vscode";
import type { ExtensionMessage } from "../../messages";

interface ContractFiles {
  nefName?: string;
  nefBase64?: string;
  manifestName?: string;
  manifestJson?: string;
}

/**
 * Holds the NEF + manifest the user picked through the host file dialog. Picking
 * a .nef auto-fills the sibling .manifest.json when one sits next to it; the
 * manifest can also be chosen on its own. Returns an error string when a pick
 * fails (the host still replies for cancellations, which are ignored).
 */
export function useContractFiles() {
  const [files, setFiles] = useState<ContractFiles>({});
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    return onMessage((msg: ExtensionMessage) => {
      if (msg.type === "contract.nef") {
        if (!msg.ok) {
          setError(msg.error);
          return;
        }
        if (!msg.nefBase64) {
          return; // cancelled
        }
        setError(undefined);
        setFiles((prev) => ({
          ...prev,
          nefName: msg.nefName,
          nefBase64: msg.nefBase64,
          manifestName: msg.manifestName ?? prev.manifestName,
          manifestJson: msg.manifestJson ?? prev.manifestJson,
        }));
      } else if (msg.type === "contract.manifest") {
        if (!msg.ok) {
          setError(msg.error);
          return;
        }
        if (!msg.manifestJson) {
          return; // cancelled
        }
        setError(undefined);
        setFiles((prev) => ({
          ...prev,
          manifestName: msg.manifestName,
          manifestJson: msg.manifestJson,
        }));
      }
    });
  }, []);

  const selectNef = () => postMessage({ type: "contract.selectNef" });
  const selectManifest = () => postMessage({ type: "contract.selectManifest" });

  return { files, error, selectNef, selectManifest };
}
