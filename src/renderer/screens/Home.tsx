import { useRouter } from "../router";
import { OptionGrid, type Option } from "../components/OptionGrid";

const TOOLS: Option[] = [
  {
    id: "invoke",
    icon: "▶",
    title: "Test Invoke",
    desc: "Run a read-only contract call and inspect the result.",
    enabled: true,
  },
  {
    id: "deploy",
    icon: "⬆",
    title: "Deploy Contract",
    desc: "Deploy a compiled NEF to a network.",
    enabled: false,
  },
  {
    id: "wallet",
    icon: "◎",
    title: "Wallet",
    desc: "Manage accounts and sign transactions.",
    enabled: true,
  },
];

export function Home() {
  const { navigate } = useRouter();

  return (
    <section>
      <h2 className="font-semibold text-base">Neo Developer Kit</h2>
      <p className="opacity-70 mb-3 text-xs">Pick a tool to get started.</p>

      <OptionGrid options={TOOLS} onSelect={navigate} />
    </section>
  );
}
