import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]",
  secondary:
    "bg-[var(--vscode-button-secondaryBackground)] text-[var(--vscode-button-secondaryForeground)] hover:bg-[var(--vscode-button-secondaryHoverBackground)]",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      className={`rounded px-3 py-1.5 font-semibold disabled:cursor-default disabled:opacity-50 ${VARIANTS[variant]} ${className}`}
    />
  );
}
