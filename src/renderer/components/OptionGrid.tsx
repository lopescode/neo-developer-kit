/** A selectable option shown as a tile (used by Home and the Wallet hub). */
export interface Option {
  id: string;
  icon: string;
  title: string;
  desc: string;
  enabled: boolean;
}

interface OptionGridProps {
  options: Option[];
  onSelect: (id: string) => void;
}

/** Renders a vertical list of tappable option tiles. */
export function OptionGrid({ options, onSelect }: OptionGridProps) {
  return (
    <div className="flex flex-col gap-2">
      {options.map((opt) => (
        <button
          key={opt.id}
          disabled={!opt.enabled}
          onClick={() => onSelect(opt.id)}
          className="flex gap-2.5 bg-[var(--vscode-editorWidget-background,rgba(127,127,127,0.08))] disabled:opacity-50 p-3 border border-[var(--vscode-widget-border,transparent)] enabled:hover:border-[var(--vscode-focusBorder)] rounded-md text-left disabled:cursor-default"
        >
          <span className="text-lg leading-none">{opt.icon}</span>

          <span className="flex-1">
            <span className="font-semibold">
              {opt.title}
              {!opt.enabled && (
                <span className="bg-[var(--vscode-badge-background)] ml-1.5 px-1.5 py-0.5 rounded-full text-[0.7em] text-[var(--vscode-badge-foreground)]">
                  soon
                </span>
              )}
            </span>

            <span className="block opacity-75 mt-0.5 text-xs">{opt.desc}</span>
          </span>
        </button>
      ))}
    </div>
  );
}
