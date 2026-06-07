import type { ReactNode } from "react";

interface FieldProps {
  label: string;
  children: ReactNode;
}

/** A labelled form row. */
export function Field({ label, children }: FieldProps) {
  return (
    <div className="mt-3">
      <label className="block mb-1 font-semibold text-xs">{label}</label>
      {children}
    </div>
  );
}
