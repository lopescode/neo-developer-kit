import { useRouter } from "../../router";
import { useAccounts } from "./useAccounts";
import { shortAddress } from "./format";

export function WalletTransfer() {
  const { navigate } = useRouter();
  const { active } = useAccounts();

  return (
    <section>
      <button
        onClick={() => navigate("wallet")}
        className="mb-2.5 text-[var(--vscode-textLink-foreground)] text-xs hover:underline"
      >
        ← Wallet
      </button>

      <h3 className="font-semibold text-sm">Transfer</h3>

      {active && (
        <p className="opacity-70 mt-1 text-xs">
          From {active.label} ·{" "}
          <span className="font-mono">{shortAddress(active.address)}</span>
        </p>
      )}

      <div className="bg-[var(--vscode-editorWidget-background,rgba(127,127,127,0.08))] mt-3 p-3 border border-[var(--vscode-widget-border,transparent)] rounded-md text-xs">
        <p className="font-semibold">Signed transfers — coming next.</p>
        <p className="opacity-75 mt-1">
          This will let you send NEO or NEP-17 tokens: pick a recipient, asset
          and amount, then sign with the active account&apos;s password. The
          transaction is built, fee-calculated and broadcast through the selected
          network&apos;s RPC.
        </p>
      </div>
    </section>
  );
}
