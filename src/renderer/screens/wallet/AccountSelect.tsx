import { postMessage } from "../../vscode";
import type { WalletAccount } from "../../messages";
import { Field } from "../../components/Field";
import { shortAddress } from "./format";

interface AccountSelectProps {
  accounts: WalletAccount[];
  active?: WalletAccount;
  onCopy: (address: string) => void;
}

/**
 * Top-of-screen account picker. Choosing an account makes it the active one
 * (the default the other wallet actions operate on).
 */
export function AccountSelect({ accounts, active, onCopy }: AccountSelectProps) {
  return (
    <Field label="Account">
      <select
        value={active?.address ?? ""}
        onChange={(e) =>
          postMessage({ type: "wallet.setActive", address: e.target.value })
        }
        className="bg-[var(--vscode-input-background)] px-2 py-1.5 border border-[var(--vscode-input-border,transparent)] rounded focus:outline outline-none focus:outline-[var(--vscode-focusBorder)] focus:outline-1 w-full text-[var(--vscode-input-foreground)]"
      >
        {accounts.map((acc) => (
          <option key={acc.address} value={acc.address}>
            {acc.label} · {shortAddress(acc.address)}
          </option>
        ))}
      </select>
      {active && (
        <button
          onClick={() => onCopy(active.address)}
          title="Copy address"
          className="block opacity-70 mt-1 font-mono text-[0.72em] hover:underline truncate"
        >
          {active.address}
        </button>
      )}
    </Field>
  );
}
