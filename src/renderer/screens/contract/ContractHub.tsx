import { useRouter } from "../../router";
import { OptionGrid, type Option } from "../../components/OptionGrid";

const ACTIONS: Option[] = [
  {
    id: "contract.deploy",
    icon: "⬆",
    title: "Deploy",
    desc: "Publish a compiled NEF + manifest to a network.",
    enabled: true,
  },
  {
    id: "contract.update",
    icon: "↻",
    title: "Update",
    desc: "Replace a contract's code in place — same script hash.",
    enabled: true,
  },
];

export function ContractHub() {
  const { navigate } = useRouter();

  return (
    <section>
      <button
        onClick={() => navigate("home")}
        className="mb-2.5 text-[var(--vscode-textLink-foreground)] text-xs hover:underline"
      >
        ← Tools
      </button>

      <h3 className="font-semibold text-sm">Manage Contract</h3>
      <p className="opacity-70 mb-3 text-xs">
        Deploy a new contract or update an existing one. Both sign with the
        active wallet account, so make sure it holds some GAS.
      </p>

      <OptionGrid options={ACTIONS} onSelect={navigate} />
    </section>
  );
}
