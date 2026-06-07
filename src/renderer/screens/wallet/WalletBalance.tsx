import { useEffect, useState } from "react";
import { useRouter } from "../../router";
import { onMessage, postMessage } from "../../vscode";
import type { ExtensionMessage, TokenBalance } from "../../messages";
import { resolveEndpoint, type NetworkId } from "../../../shared/networks";
import { Button } from "../../components/Button";
import { NetworkSelect } from "../../components/NetworkSelect";
import { Status } from "../../components/Status";
import type { StatusValue } from "../../components/Status";
import { useAccounts } from "./useAccounts";
import { shortAddress } from "./format";

export function WalletBalance() {
  const { navigate } = useRouter();
  const { active } = useAccounts();

  const [network, setNetwork] = useState<NetworkId>("testnet");
  const [customRpc, setCustomRpc] = useState("");
  const [assets, setAssets] = useState<TokenBalance[] | null>(null);
  const [status, setStatus] = useState<StatusValue>({ text: "", kind: "" });

  useEffect(() => {
    return onMessage((msg: ExtensionMessage) => {
      if (msg.type !== "wallet.balance") {
        return;
      }
      if (!msg.ok) {
        setStatus({ text: "✖ " + msg.error, kind: "error" });
        return;
      }
      setAssets(msg.assets);
      setStatus({ text: "", kind: "" });
    });
  }, []);

  // Balances are network-scoped; drop stale results when the network changes.
  function changeNetwork(next: NetworkId) {
    setNetwork(next);
    setAssets(null);
  }

  function check() {
    if (!active) {
      return;
    }
    const rpc = resolveEndpoint(network, customRpc).trim();
    if (!rpc) {
      setStatus({ text: "✖ Set a custom RPC first.", kind: "error" });
      return;
    }
    setAssets(null);
    setStatus({ text: "Checking balance…", kind: "pending" });
    postMessage({ type: "wallet.balance", address: active.address, rpc });
  }

  return (
    <section>
      <button
        onClick={() => navigate("wallet")}
        className="mb-2.5 text-[var(--vscode-textLink-foreground)] text-xs hover:underline"
      >
        ← Wallet
      </button>

      <h3 className="font-semibold text-sm">Check balance</h3>

      {!active ? (
        <p className="opacity-60 mt-2 text-xs">No account selected.</p>
      ) : (
        <>
          <p className="opacity-70 mt-1 text-xs">
            {active.label} ·{" "}
            <span className="font-mono">{shortAddress(active.address)}</span>
          </p>

          <NetworkSelect
            network={network}
            onNetworkChange={changeNetwork}
            customRpc={customRpc}
            onCustomRpcChange={setCustomRpc}
          />

          <Button className="mt-3 w-full" onClick={check}>
            Check balance
          </Button>

          {assets && (
            <ul className="flex flex-col gap-1 mt-3">
              {assets.map((a) => (
                <li
                  key={a.hash}
                  className="flex justify-between items-center bg-[var(--vscode-editorWidget-background,rgba(127,127,127,0.08))] px-2.5 py-1.5 rounded text-xs"
                >
                  <span className="min-w-0">
                    <span className="font-semibold">{a.symbol}</span>
                    {!a.trusted && (
                      <span
                        title={`Unverified token · ${a.hash}`}
                        className="block opacity-60 font-mono text-[0.85em] truncate"
                      >
                        ⚠ unverified · {a.hash.slice(0, 8)}…{a.hash.slice(-4)}
                      </span>
                    )}
                  </span>
                  <span className="ml-2 font-mono whitespace-nowrap">
                    {a.amount}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {assets && assets.some((a) => !a.trusted) && (
            <p className="opacity-55 mt-2 text-[0.72em]">
              ⚠ Unverified tokens self-report their name. Only NEO and GAS are
              matched by their official contract — treat look-alikes as spam.
            </p>
          )}

          <Status value={status} />
        </>
      )}
    </section>
  );
}
