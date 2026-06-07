import { useEffect, useState } from "react";
import { onMessage, postMessage } from "../../vscode";
import type { ExtensionMessage, WalletAccount } from "../../messages";

/**
 * Subscribes to the wallet account list from the host. Requests it on mount and
 * stays in sync with any account change (create/import/remove/setActive all
 * reply with `wallet.accounts`). The active account is the NEP-6 default.
 */
export function useAccounts() {
  const [accounts, setAccounts] = useState<WalletAccount[]>([]);
  const [error, setError] = useState<string | undefined>();

  useEffect(() => {
    const unsubscribe = onMessage((msg: ExtensionMessage) => {
      if (msg.type !== "wallet.accounts") {
        return;
      }
      if (msg.ok) {
        setAccounts(msg.accounts);
        setError(undefined);
      } else {
        setError(msg.error);
      }
    });
    postMessage({ type: "wallet.list" });
    return unsubscribe;
  }, []);

  const active = accounts.find((a) => a.isActive);
  return { accounts, active, error };
}
