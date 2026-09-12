"use client";

import { useMemo } from "react";
import { useBell } from "@/hooks/useBell";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useTimelineTimer } from "@/hooks/useTimelineTimer";
import { formatClock, HOUR_MS, MINUTE_MS, SECOND_MS } from "@/lib/time";
import type { TimerPhase } from "@/types/timer";
import { NumberField } from "./NumberField";
import { SessionConfigPanel } from "./SessionConfigPanel";
import { TimerStage } from "./TimerStage";
import { DurationField } from "./DurationField";
import { TimeDisplay } from "./TimeDisplay";

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

  return <section className="training-layout" aria-label="CountdownTimer">
<SessionConfigPanel title="Duration" editable={editable} summary={formatClock(timer.totalDurationMs, config.hours > 0)} error={timer.totalDurationMs <= 0 ? "Set a duration of at least one second." : undefined}>
          <NumberField label="Hours" value={config.hours} min={0} max={23} suffix="h" onChange={value => set("hours", value)} />
          <DurationField label="Minutes / seconds" minutes={config.minutes} seconds={config.seconds} maxMinutes={59} onChange={(minutes, seconds) => setConfig(current => ({...current, minutes, seconds}))} />
          <p className="field-note">The bell sounds when your time is up.</p>
        </SessionConfigPanel>
        <TimerStage status={timer.status} phase={timer.status === "idle" ? "Ready" : "Countdown"} context={timer.status === "complete" ? "Time is up" : "Countdown"} summary={`${formatClock(timer.totalDurationMs, config.hours > 0)} total`} progress={timer.progress} onStart={start} onPause={timer.pause} onReset={reset} canStart={timer.totalDurationMs > 0}>
          <TimeDisplay milliseconds={timer.phaseRemainingMs} showHours={config.hours > 0} />
        </TimerStage>
  </section>;
}
