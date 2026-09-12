import { formatClock } from "@/lib/time";

interface TimeDisplayProps {
  milliseconds: number;
  showHours?: boolean;
  muted?: boolean;
}

export function TimeDisplay({ milliseconds, showHours, muted }: TimeDisplayProps) {
  return (
    <time
      className={`time-digits ${showHours ? "time-digits--hours" : ""} ${muted ? "time-muted" : ""}`}
      dateTime={`PT${Math.ceil(Math.max(0, milliseconds) / 1000)}S`}
    >
      {formatClock(milliseconds, showHours)}
    </time>
  );
}
