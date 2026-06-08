import { Button } from "../../components/Button";
import { Field } from "../../components/Field";

interface ContractFilePickerProps {
  nefName?: string;
  manifestName?: string;
  onSelectNef: () => void;
  onSelectManifest: () => void;
}

/** Two file pickers for the NEF and its manifest, showing the chosen names. */
export function ContractFilePicker({
  nefName,
  manifestName,
  onSelectNef,
  onSelectManifest,
}: ContractFilePickerProps) {
  return (
    <Field label="Contract files">
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onSelectNef}>
            Select .nef
          </Button>
          <span className="opacity-75 text-xs break-all">
            {nefName ?? "no file selected"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={onSelectManifest}>
            Select manifest
          </Button>
          <span className="opacity-75 text-xs break-all">
            {manifestName ?? "auto-detected next to the .nef"}
          </span>
        </div>
      </div>
    </Field>
  );
}
