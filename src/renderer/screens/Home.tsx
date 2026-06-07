import { useRouter } from "../router";

interface Tool {
  id: string;
  icon: string;
  title: string;
  desc: string;
  enabled: boolean;
}

const TOOLS: Tool[] = [
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
    enabled: false,
  },
];

export function Home() {
  const { navigate } = useRouter();

  return (
    <section>
      <h2 className="font-semibold text-base">Neo Developer Kit</h2>
      <p className="opacity-70 mb-3 text-xs">Pick a tool to get started.</p>

      <div className="flex flex-col gap-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            disabled={!tool.enabled}
            onClick={() => navigate(tool.id)}
            className="flex gap-2.5 bg-[var(--vscode-editorWidget-background,rgba(127,127,127,0.08))] disabled:opacity-50 p-3 border border-[var(--vscode-widget-border,transparent)] enabled:hover:border-[var(--vscode-focusBorder)] rounded-md text-left disabled:cursor-default"
          >
            <span className="text-lg leading-none">{tool.icon}</span>

            <span className="flex-1">
              <span className="font-semibold">
                {tool.title}
                {!tool.enabled && (
                  <span className="bg-[var(--vscode-badge-background)] ml-1.5 px-1.5 py-0.5 rounded-full text-[0.7em] text-[var(--vscode-badge-foreground)]">
                    soon
                  </span>
                )}
              </span>

              <span className="block opacity-75 mt-0.5 text-xs">
                {tool.desc}
              </span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
