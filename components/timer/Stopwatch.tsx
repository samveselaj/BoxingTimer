"use client";

import { useStopwatch } from "@/hooks/useStopwatch";
import { formatStopwatch, MINUTE_MS } from "@/lib/time";
import { CircularProgress } from "./CircularProgress";
import { TimerControls } from "./TimerControls";
import { ToolHeader } from "./ToolHeader";

export function Stopwatch() {
  const stopwatch = useStopwatch();
  const time = formatStopwatch(stopwatch.elapsedMs);
  const minuteProgress = (stopwatch.elapsedMs % MINUTE_MS) / MINUTE_MS;

  return (
    <section className="utility-view">
      <ToolHeader
        title="Stopwatch"
        description="A drift-free elapsed clock for bag work, roadwork, and unstructured rounds."
      />
      <div className="flex flex-col items-center py-1 sm:py-3">
        <CircularProgress
          progress={minuteProgress}
          color="#dcff52"
          label="Current minute progress"
          surfaceColor="#0d100a"
          trackColor="rgba(220,255,82,0.11)"
          solo
        >
          <span
            className={`mb-[clamp(0.65rem,2.5cqw,1.35rem)] font-display text-[clamp(0.9rem,4.5cqw,1.7rem)] font-bold uppercase leading-none tracking-[0.12em] ${
              stopwatch.status === "running" ? "text-acid" : "text-zinc-500"
            }`}
          >
            {stopwatch.status === "running"
              ? "Running"
              : stopwatch.status === "paused"
                ? "Paused"
                : "Ready"}
          </span>
          <div className="flex items-baseline whitespace-nowrap font-mono tabular-nums">
            <time className="text-[clamp(3rem,21cqw,8.5rem)] font-semibold leading-[0.85] tracking-[-0.09em] text-white">
              {time.main}
            </time>
            <span className="ml-2 text-[clamp(1rem,5.5cqw,2.2rem)] font-semibold tracking-[-0.05em] text-zinc-500 sm:ml-3">
              {time.fraction}
            </span>
          </div>
          <p className="mt-[clamp(0.7rem,2.7cqw,1.4rem)] text-[clamp(0.625rem,2.2cqw,0.72rem)] font-medium tracking-[-0.005em] text-zinc-600">minutes · seconds · hundredths</p>
        </CircularProgress>
        <div className="mt-2 w-full max-w-xl">
          <TimerControls
            status={stopwatch.status}
            onStart={stopwatch.start}
            onPause={stopwatch.pause}
            onReset={stopwatch.reset}
            startLabel="Start clock"
          />
        </div>
      </div>
    </section>
  );
}
