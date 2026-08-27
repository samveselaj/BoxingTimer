"use client";

import { useMemo } from "react";
import { useBell } from "@/hooks/useBell";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useTimelineTimer } from "@/hooks/useTimelineTimer";
import { formatClock, HOUR_MS, MINUTE_MS, SECOND_MS } from "@/lib/time";
import type { TimerPhase } from "@/types/timer";
import { CircularProgress } from "./CircularProgress";
import { NumberField } from "./NumberField";
import { SessionConfigPanel } from "./SessionConfigPanel";
import { TimeDisplay } from "./TimeDisplay";
import { TimerControls } from "./TimerControls";
import { ToolHeader } from "./ToolHeader";

interface CountdownConfig {
  hours: number;
  minutes: number;
  seconds: number;
}

const DEFAULT_CONFIG: CountdownConfig = { hours: 0, minutes: 5, seconds: 0 };

export function CountdownTimer() {
  const [config, setConfig] = usePersistentState("corner:countdown-config", DEFAULT_CONFIG);
  const { playBell, prime, stopBell } = useBell();
  const phases = useMemo<TimerPhase[]>(
    () => [
      {
        id: "countdown",
        kind: "countdown",
        durationMs:
          Math.max(0, config.hours) * HOUR_MS +
          Math.max(0, config.minutes) * MINUTE_MS +
          Math.max(0, config.seconds) * SECOND_MS,
      },
    ],
    [config],
  );
  const timer = useTimelineTimer(phases, { onBoundary: playBell });
  const editable = timer.status === "idle" || timer.status === "complete";

  const set = <K extends keyof CountdownConfig>(key: K, value: CountdownConfig[K]) =>
    setConfig((current) => ({ ...current, [key]: value }));

  const start = () => {
    prime();
    timer.start();
  };

  const reset = () => {
    stopBell();
    timer.reset();
  };

  return (
    <section className="utility-view">
      <ToolHeader
        title="Countdown timer"
        description="Set a precise target. The bell sounds once when the clock reaches zero."
      />
      <div className="training-layout grid items-start gap-2.5 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-6">
        <SessionConfigPanel
          title="Duration"
          editable={editable}
          summary={formatClock(timer.totalDurationMs, config.hours > 0)}
        >
          <div className="config-grid grid grid-cols-3 gap-2">
            <NumberField
              label="Hours"
              value={config.hours}
              min={0}
              max={23}
              suffix="h"
              disabled={!editable}
              onChange={(value) => set("hours", value)}
            />
            <NumberField
              label="Minutes"
              value={config.minutes}
              min={0}
              max={59}
              suffix="m"
              disabled={!editable}
              onChange={(value) => set("minutes", value)}
            />
            <NumberField
              label="Seconds"
              value={config.seconds}
              min={0}
              max={59}
              suffix="s"
              disabled={!editable}
              onChange={(value) => set("seconds", value)}
            />
          </div>
        </SessionConfigPanel>

        <div className="training-stage order-2 flex min-w-0 flex-col items-center">
          <CircularProgress
            progress={timer.status === "complete" ? 1 : timer.progress}
            color={timer.status === "complete" ? "#fb7185" : "#dcff52"}
            label="Countdown progress"
            surfaceColor={timer.status === "complete" ? "#160e11" : "#11140c"}
            trackColor="rgba(220,255,82,0.12)"
          >
            <span
              className={`mb-[clamp(0.65rem,2.5cqw,1.35rem)] font-display text-[clamp(0.9rem,4.5cqw,1.7rem)] font-bold uppercase leading-none tracking-[0.12em] ${
                timer.status === "complete" ? "animate-pulse-soft text-danger" : "text-acid"
              }`}
              aria-live="assertive"
            >
              {timer.status === "complete"
                ? "Time"
                : timer.status === "paused"
                  ? "Paused"
                  : timer.status === "running"
                    ? "Counting down"
                    : "Ready"}
            </span>
            <TimeDisplay
              milliseconds={timer.phaseRemainingMs}
              showHours={config.hours > 0}
              muted={timer.status === "complete"}
            />
            <p className="mt-[clamp(0.7rem,2.7cqw,1.4rem)] text-[clamp(0.625rem,2.2cqw,0.72rem)] font-medium tracking-[-0.005em] text-zinc-600">
              {timer.status === "complete" ? "Countdown complete" : "hours · minutes · seconds"}
            </p>
          </CircularProgress>
          <div className="mt-2 w-full max-w-xl">
            <TimerControls
              status={timer.status}
              onStart={start}
              onPause={timer.pause}
              onReset={reset}
              startLabel="Start timer"
              canStart={timer.totalDurationMs > 0}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
