export type StatusKind = "ok" | "error" | "pending" | "";

export interface StatusValue {
  text: string;
  kind: StatusKind;
}

const COLORS: Record<StatusKind, string> = {
  ok: "text-[var(--vscode-testing-iconPassed,#2ea043)]",
  error: "text-[var(--vscode-errorForeground,#f14c4c)]",
  pending: "opacity-75",
  "": "",
};

export function Status({ value }: { value: StatusValue }) {
  if (!value.text) {
    return null;
  }
  return (
    <div
      className={`mt-3 mb-1.5 min-h-[1.2em] font-semibold ${COLORS[value.kind]}`}
    >
      {value.text}
    </div>
  );
}
