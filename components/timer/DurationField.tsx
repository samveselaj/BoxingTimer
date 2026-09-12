import { useId } from "react";
interface DurationFieldProps { label: string; minutes: number; seconds: number; maxMinutes: number; onChange: (minutes: number, seconds: number) => void; }
export function DurationField({label, minutes, seconds, maxMinutes, onChange}: DurationFieldProps) {
  const id = useId();
  const value = minutes * 60 + seconds;
  const max = maxMinutes * 60 + 59;
  const step = (amount: number) => { const next = Math.max(0, Math.min(max, value + amount)); onChange(Math.floor(next / 60), next % 60); };
  const valid = (value: number, max: number) => Number.isFinite(value) ? Math.min(max, Math.max(0, Math.floor(value))) : 0;
  return <div className="setting-row">
    <span id={id}>{label}</span>
    <div className="number-control" role="group" aria-labelledby={id}>
      <button type="button" aria-label={`Decrease ${label} by 15 seconds`} disabled={value === 0} onClick={() => step(-15)}>−</button>
      <div className="duration-value">
        <input type="number" inputMode="numeric" aria-label={`${label} minutes`} min={0} max={maxMinutes} value={minutes.toString().padStart(2, "0")} onChange={e => onChange(valid(e.target.valueAsNumber, maxMinutes), seconds)} />
        <span>:</span>
        <input type="number" inputMode="numeric" aria-label={`${label} seconds`} min={0} max={59} value={seconds.toString().padStart(2, "0")} onChange={e => onChange(minutes, valid(e.target.valueAsNumber, 59))} />
      </div>
      <button type="button" aria-label={`Increase ${label} by 15 seconds`} disabled={value === max} onClick={() => step(15)}>+</button>
    </div>
  </div>;
}
