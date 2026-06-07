import type { InputHTMLAttributes } from "react";

export function TextInput({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      spellCheck={false}
      {...props}
      className={`w-full rounded border border-[var(--vscode-input-border,transparent)] bg-[var(--vscode-input-background)] px-2 py-1.5 text-[var(--vscode-input-foreground)] outline-none focus:outline focus:outline-1 focus:outline-[var(--vscode-focusBorder)] ${className}`}
    />
  );
}
