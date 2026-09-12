"use client";

import { useMemo } from "react";
import { useBell } from "@/hooks/useBell";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useTimelineTimer } from "@/hooks/useTimelineTimer";
import { formatClock, MINUTE_MS, SECOND_MS } from "@/lib/time";
import type { TimerPhase } from "@/types/timer";
import { NumberField } from "./NumberField";
import { SessionConfigPanel } from "./SessionConfigPanel";
import { TimerStage } from "./TimerStage";
import { DurationField } from "./DurationField";
import { TimeDisplay } from "./TimeDisplay";

interface ContinuousConfig {
  rounds: number;
  minutes: number;
  seconds: number;
}

const DEFAULT_CONFIG: ContinuousConfig = { rounds: 10, minutes: 3, seconds: 0 };

export function ContinuousRoundTimer() {
  const [config, setConfig] = usePersistentState("corner:continuous-config", DEFAULT_CONFIG);
  const { playBell, stopBell } = useBell();
  const phases = useMemo<TimerPhase[]>(() => {
    const duration =
      Math.max(0, config.minutes) * MINUTE_MS + Math.max(0, config.seconds) * SECOND_MS;
    return Array.from({ length: Math.max(1, config.rounds) }, (_, index) => ({
      id: `continuous-${index + 1}`,
      kind: "round" as const,
      durationMs: duration,
      round: index + 1,
    }));
  }, [config]);
  const timer = useTimelineTimer(phases, { onBoundary: playBell });
  const phase = phases[timer.phaseIndex];
  const editable = timer.status === "idle" || timer.status === "complete";

  const set = <K extends keyof ContinuousConfig>(key: K, value: ContinuousConfig[K]) =>
    setConfig((current) => ({ ...current, [key]: value }));

  const start = () => {
    if (timer.status !== "paused") playBell();
    timer.start();
  };

  const reset = () => {
    stopBell();
    timer.reset();
  };

  return <section className="training-layout" aria-label="ContinuousRoundTimer">
<SessionConfigPanel title="Session" editable={editable} summary={`${config.rounds} rounds · ${formatClock(phases[0]?.durationMs ?? 0)} each`} error={timer.totalDurationMs <= 0 ? "Set a round duration of at least one second." : undefined}>
          <NumberField label="Rounds" value={config.rounds} min={1} max={50} onChange={value => set("rounds", value)} />
          <DurationField label="Round time" minutes={config.minutes} seconds={config.seconds} maxMinutes={60} onChange={(minutes, seconds) => setConfig(current => ({...current, minutes, seconds}))} />
          <p className="field-note">Back-to-back rounds. A bell at every boundary.</p>
        </SessionConfigPanel>
        <TimerStage status={timer.status} phase="Work" context={timer.status === "complete" ? `${config.rounds} rounds complete` : `Round ${phase?.round ?? 1} / ${config.rounds}`} summary={`${formatClock(phases[0]?.durationMs ?? 0)} rounds · No rest`} progress={timer.progress} onStart={start} onPause={timer.pause} onReset={reset} canStart={timer.totalDurationMs > 0}>
          <TimeDisplay milliseconds={timer.phaseRemainingMs} />
        </TimerStage>
  </section>;
}
