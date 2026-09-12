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

interface RoundConfig {
  rounds: number;
  roundMinutes: number;
  roundSeconds: number;
  restMinutes: number;
  restSeconds: number;
}

const DEFAULT_CONFIG: RoundConfig = {
  rounds: 10,
  roundMinutes: 3,
  roundSeconds: 0,
  restMinutes: 1,
  restSeconds: 0,
};

export function RoundTimer() {
  const [config, setConfig] = usePersistentState("corner:round-config", DEFAULT_CONFIG);
  const { playBell, stopBell } = useBell();
  const roundDurationMs =
    Math.max(0, config.roundMinutes) * MINUTE_MS +
    Math.max(0, config.roundSeconds) * SECOND_MS;
  const restDurationMs =
    Math.max(0, config.restMinutes) * MINUTE_MS +
    Math.max(0, config.restSeconds) * SECOND_MS;
  const phases = useMemo<TimerPhase[]>(() => {
    const result: TimerPhase[] = [];

    for (let round = 1; round <= Math.max(1, config.rounds); round += 1) {
      result.push({ id: `round-${round}`, kind: "round", durationMs: roundDurationMs, round });
      if (round < config.rounds && restDurationMs > 0) {
        result.push({ id: `rest-${round}`, kind: "rest", durationMs: restDurationMs, round });
      }
    }
    return result;
  }, [config, restDurationMs, roundDurationMs]);

  const timer = useTimelineTimer(phases, { onBoundary: playBell });
  const phase = phases[timer.phaseIndex];
  const editable = timer.status === "idle" || timer.status === "complete";
  const isRest = phase?.kind === "rest";
  const roundContext =
    timer.status === "complete"
      ? `${config.rounds} rounds complete`
      : isRest
        ? `Next · Round ${Math.min(config.rounds, (phase?.round ?? 0) + 1)} / ${config.rounds}`
        : `Round ${phase?.round ?? 1} / ${config.rounds}`;

  const set = <K extends keyof RoundConfig>(key: K, value: RoundConfig[K]) =>
    setConfig((current) => ({ ...current, [key]: value }));

  const start = () => {
    if (timer.status !== "paused") playBell();
    timer.start();
  };

  const reset = () => {
    stopBell();
    timer.reset();
  };

  return <section className="training-layout" aria-label="RoundTimer">
<SessionConfigPanel title="Session" editable={editable} summary={`${config.rounds} rounds · ${formatClock(roundDurationMs)} work · ${formatClock(restDurationMs)} rest`} error={roundDurationMs <= 0 ? "Set a work duration of at least one second." : undefined}>
          <NumberField label="Rounds" value={config.rounds} min={1} max={30} onChange={value => set("rounds", value)} />
          <DurationField label="Work time" minutes={config.roundMinutes} seconds={config.roundSeconds} maxMinutes={30} onChange={(roundMinutes, roundSeconds) => setConfig(current => ({...current, roundMinutes, roundSeconds}))} />
          <DurationField label="Rest time" minutes={config.restMinutes} seconds={config.restSeconds} maxMinutes={10} onChange={(restMinutes, restSeconds) => setConfig(current => ({...current, restMinutes, restSeconds}))} />
        </SessionConfigPanel>
        <TimerStage status={timer.status} phase={isRest ? "Rest" : "Work"} rest={isRest} context={roundContext} summary={`${config.rounds} rounds · ${formatClock(roundDurationMs)} work · ${formatClock(restDurationMs)} rest`} progress={timer.progress} onStart={start} onPause={timer.pause} onReset={reset} canStart={roundDurationMs > 0}>
          <TimeDisplay milliseconds={timer.phaseRemainingMs} />
        </TimerStage>
  </section>;
}
