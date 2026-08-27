import { clampInteger } from "@/lib/time";

interface NumberFieldProps {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix?: string;
  disabled?: boolean;
  onChange: (value: number) => void;
}

export function NumberField({
  label,
  value,
  min,
  max,
  suffix,
  disabled,
  onChange,
}: NumberFieldProps) {
  const update = (next: number) => onChange(clampInteger(next, min, max));

  return (
    <label className="group flex min-w-0 flex-1 flex-col gap-1.5">
      <span className="number-label truncate text-[0.66rem] font-semibold tracking-[-0.005em] text-zinc-500">
        {label}
      </span>
      <span className="number-control flex h-[3.25rem] items-center rounded-xl border border-zinc-800 bg-[#15171a] px-0.5 transition-colors group-focus-within:border-acid/60 group-focus-within:bg-[#181a1d]">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => update(value - 1)}
          disabled={disabled || value <= min}
          className="number-step grid h-11 w-8 shrink-0 place-items-center rounded-lg text-xl font-light text-zinc-500 transition-colors hover:bg-zinc-700/60 hover:text-white disabled:opacity-20"
        >
          −
        </button>
        <span className="flex min-w-0 flex-1 items-baseline justify-center gap-1">
          <input
            type="number"
            inputMode="numeric"
            aria-label={label}
            min={min}
            max={max}
            value={value}
            disabled={disabled}
            onChange={(event) => update(event.target.valueAsNumber)}
            className="number-input w-7 min-w-0 bg-transparent text-center font-mono text-lg font-semibold tabular-nums text-white outline-none disabled:text-zinc-500 sm:w-8"
          />
          {suffix ? <span className="text-[0.62rem] font-semibold text-zinc-600">{suffix}</span> : null}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => update(value + 1)}
          disabled={disabled || value >= max}
          className="number-step grid h-11 w-8 shrink-0 place-items-center rounded-lg text-xl font-light text-zinc-500 transition-colors hover:bg-zinc-700/60 hover:text-white disabled:opacity-20"
        >
          +
        </button>
      </span>
    </label>
  );
}
