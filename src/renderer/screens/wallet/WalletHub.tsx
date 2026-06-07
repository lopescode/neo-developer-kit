import { useEffect, useState } from "react";
import { useRouter } from "../../router";
import { onMessage, postMessage } from "../../vscode";
import type { ExtensionMessage } from "../../messages";
import { Button } from "../../components/Button";
import { OptionGrid, type Option } from "../../components/OptionGrid";
import { Status } from "../../components/Status";
import type { StatusValue } from "../../components/Status";
import { useAccounts } from "./useAccounts";
import { AccountSelect } from "./AccountSelect";
import { shortAddress } from "./format";

const ACTIONS: Option[] = [
  {
    id: "wallet.balance",
    icon: "≈",
    title: "Check balance",
    desc: "See NEO, GAS and tokens for this account on a network.",
    enabled: true,
  },
  {
    id: "wallet.transfer",
    icon: "➤",
    title: "Transfer",
    desc: "Send NEO or NEP-17 tokens with a signed transaction.",
    enabled: false,
  },
  {
    id: "backup",
    icon: "⤓",
    title: "Backup",
    desc: "Export an encrypted NEP-6 wallet file you can store safely.",
    enabled: true,
  },
];

export function WalletHub() {
  const { navigate } = useRouter();
  const { accounts, active, error } = useAccounts();
  const [status, setStatus] = useState<StatusValue>({ text: "", kind: "" });

  // The hub triggers Backup as an action, so it listens for its result.
  useEffect(() => {
    return onMessage((msg: ExtensionMessage) => {
      if (msg.type !== "wallet.backup") {
        return;
      }
      if (!msg.ok) {
        setStatus({ text: "✖ " + msg.error, kind: "error" });
      } else if (msg.path) {
        setStatus({ text: "✔ Backup saved", kind: "ok" });
      } else {
        setStatus({ text: "", kind: "" }); // cancelled
      }
    });
  }, []);

  function copy(address: string) {
    navigator.clipboard?.writeText(address);
    setStatus({ text: `✔ Copied ${shortAddress(address)}`, kind: "ok" });
  }

  function onSelect(id: string) {
    if (id === "backup") {
      setStatus({ text: "Choose where to save…", kind: "pending" });
      postMessage({ type: "wallet.backup" });
    } else {
      navigate(id);
    }
  }

  function remove() {
    if (active) {
      postMessage({ type: "wallet.remove", address: active.address });
    }
  }

  const hasAccounts = accounts.length > 0;

  return (
    <section>
      <button
        onClick={() => navigate("home")}
        className="mb-2.5 text-[var(--vscode-textLink-foreground)] text-xs hover:underline"
      >
        ← Tools
      </button>

      <h3 className="font-semibold text-sm">Wallet</h3>
      <p className="opacity-70 mb-1 text-xs">
        Accounts are NEP-2 encrypted with your password and kept in the OS secret
        store. Pick an account, then choose an action.
      </p>

      {error && (
        <p className="mt-2 text-[var(--vscode-errorForeground)] text-xs">
          ✖ {error}
        </p>
      )}

      {hasAccounts ? (
        <>
          <AccountSelect accounts={accounts} active={active} onCopy={copy} />

          <div className="flex gap-3 mt-1.5 text-[0.78em]">
            <button
              onClick={() => postMessage({ type: "wallet.create" })}
              className="text-[var(--vscode-textLink-foreground)] hover:underline"
            >
              + Create
            </button>
            <button
              onClick={() => postMessage({ type: "wallet.import" })}
              className="text-[var(--vscode-textLink-foreground)] hover:underline"
            >
              ↓ Import
            </button>
            <button
              onClick={remove}
              className="ml-auto text-[var(--vscode-errorForeground)] hover:underline"
            >
              Remove
            </button>
          </div>

          <div className="mt-4">
            <OptionGrid options={ACTIONS} onSelect={onSelect} />
          </div>
        </>
      ) : (
        <div className="mt-4">
          <p className="opacity-60 mb-3 text-xs">No accounts yet.</p>
          <div className="flex gap-1.5">
            <Button
              className="flex-1"
              onClick={() => postMessage({ type: "wallet.create" })}
            >
              Create account
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={() => postMessage({ type: "wallet.import" })}
            >
              Import key
            </Button>
          </div>
        </div>
      )}

      <Status value={status} />
    </section>
  );
}
