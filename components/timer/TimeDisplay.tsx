import { formatClock } from "@/lib/time";

interface TimeDisplayProps {
  milliseconds: number;
  showHours?: boolean;
  muted?: boolean;
}

export function TimeDisplay({ milliseconds, showHours, muted }: TimeDisplayProps) {
  return (
    <time
      className={`whitespace-nowrap font-mono font-semibold leading-[0.85] tabular-nums ${
        showHours
          ? "text-[clamp(2.5rem,15cqw,6.3rem)] tracking-[-0.085em]"
          : "text-[clamp(3.5rem,24cqw,9.5rem)] tracking-[-0.095em]"
      } ${
        muted ? "text-zinc-500" : "text-white"
      }`}
      dateTime={`PT${Math.ceil(Math.max(0, milliseconds) / 1000)}S`}
    >
      {formatClock(milliseconds, showHours)}
    </time>
  );
}
