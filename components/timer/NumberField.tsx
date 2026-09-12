import { useId } from "react";
import { clampInteger } from "@/lib/time";
interface NumberFieldProps {
  label: string; value: number; min: number; max: number; suffix?: string; disabled?: boolean; onChange: (value: number) => void;
}
export function NumberField({label, value, min, max, suffix, disabled, onChange}: NumberFieldProps) {
  const id = useId();
  const update = (next: number) => onChange(clampInteger(next, min, max));
  return <div className="setting-row">
    <label htmlFor={id}>{label}</label>
    <div className="number-control">
      <button type="button" aria-label={`Decrease ${label}`} onClick={() => update(value - 1)} disabled={disabled || value <= min}>−</button>
      <div className="number-value"><input id={id} type="number" inputMode="numeric" min={min} max={max} value={value} disabled={disabled} onChange={event => update(event.target.valueAsNumber)} />{suffix ? <span>{suffix}</span> : null}</div>
      <button type="button" aria-label={`Increase ${label}`} onClick={() => update(value + 1)} disabled={disabled || value >= max}>+</button>
    </div>
  </div>;
}
