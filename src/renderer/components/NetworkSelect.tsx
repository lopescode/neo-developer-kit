import { resolveEndpoint, type NetworkId } from "../../shared/networks";
import { TextInput } from "./TextInput";
import { Field } from "./Field";

interface NetworkSelectProps {
  network: NetworkId;
  onNetworkChange: (network: NetworkId) => void;
  customRpc: string;
  onCustomRpcChange: (rpc: string) => void;
}

/**
 * Controlled network picker: TestNet / MainNet / Custom. The free-text RPC
 * field is shown only for Custom; built-in networks display their endpoint.
 */
export function NetworkSelect({
  network,
  onNetworkChange,
  customRpc,
  onCustomRpcChange,
}: NetworkSelectProps) {
  return (
    <Field label="Network">
      <select
        value={network}
        onChange={(e) => onNetworkChange(e.target.value as NetworkId)}
        className="bg-[var(--vscode-input-background)] px-2 py-1.5 border border-[var(--vscode-input-border,transparent)] rounded focus:outline outline-none focus:outline-[var(--vscode-focusBorder)] focus:outline-1 w-full text-[var(--vscode-input-foreground)]"
      >
        <option value="testnet">TestNet</option>
        <option value="mainnet">MainNet</option>
        <option value="custom">Custom…</option>
      </select>
      {network === "custom" ? (
        <div className="mt-1.5">
          <TextInput
            value={customRpc}
            placeholder="https://your-node:443"
            onChange={(e) => onCustomRpcChange(e.target.value)}
          />
        </div>
      ) : (
        <div className="opacity-70 mt-1 text-[0.78em] break-all">
          {resolveEndpoint(network, customRpc)}
        </div>
      )}
    </Field>
  );
}
