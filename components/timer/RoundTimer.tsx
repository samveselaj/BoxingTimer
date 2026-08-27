"use client";

import { useMemo } from "react";
import { useBell } from "@/hooks/useBell";
import { usePersistentState } from "@/hooks/usePersistentState";
import { useTimelineTimer } from "@/hooks/useTimelineTimer";
import { formatClock, MINUTE_MS, SECOND_MS } from "@/lib/time";
import type { TimerPhase } from "@/types/timer";
import { CircularProgress } from "./CircularProgress";
import { NumberField } from "./NumberField";
import { SessionConfigPanel } from "./SessionConfigPanel";
import { TimeDisplay } from "./TimeDisplay";
import { TimerControls } from "./TimerControls";
import { ToolHeader } from "./ToolHeader";

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
  const phaseLabel = timer.status === "complete" ? "Complete" : isRest ? "Rest" : "Round";
  const ringColor = timer.status === "complete" ? "#fb7185" : isRest ? "#63a9ff" : "#dcff52";
  const surfaceColor = timer.status === "complete" ? "#160e11" : isRest ? "#0c1724" : "#11140c";
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

  return (
    <section className="utility-view">
      <ToolHeader
        title="Boxing rounds"
        description="Timed work and recovery phases. Every boundary advances automatically."
      />
      <div className="training-layout grid items-start gap-2.5 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-6">
        <SessionConfigPanel
          title="Session"
          editable={editable}
          summary={`${config.rounds} rounds · ${formatClock(roundDurationMs)} work · ${restDurationMs > 0 ? `${formatClock(restDurationMs)} rest` : "no rest"}`}
          error={roundDurationMs <= 0 ? "Round duration must be at least one second." : undefined}
        >
          <div className="config-grid grid grid-cols-3 gap-2">
            <NumberField
              label="Rounds"
              value={config.rounds}
              min={1}
              max={30}
              disabled={!editable}
              onChange={(value) => set("rounds", value)}
            />
            <NumberField
                label="Work min"
                value={config.roundMinutes}
                min={0}
                max={30}
                suffix="m"
                disabled={!editable}
                onChange={(value) => set("roundMinutes", value)}
              />
            <NumberField
                label="Work sec"
                value={config.roundSeconds}
                min={0}
                max={59}
                suffix="s"
                disabled={!editable}
                onChange={(value) => set("roundSeconds", value)}
              />
            <NumberField
                label="Rest min"
                value={config.restMinutes}
                min={0}
                max={10}
                suffix="m"
                disabled={!editable}
                onChange={(value) => set("restMinutes", value)}
              />
            <NumberField
                label="Rest sec"
                value={config.restSeconds}
                min={0}
                max={59}
                suffix="s"
                disabled={!editable}
                onChange={(value) => set("restSeconds", value)}
              />
          </div>
        </SessionConfigPanel>

        <div className="training-stage order-2 flex min-w-0 flex-col items-center">
          <CircularProgress
            progress={timer.status === "complete" ? 1 : timer.progress}
            color={ringColor}
            label={`${phaseLabel} progress`}
            surfaceColor={surfaceColor}
            trackColor={isRest ? "rgba(99,169,255,0.16)" : "rgba(220,255,82,0.12)"}
          >
            <div className="mb-[clamp(0.55rem,2cqw,1.15rem)] flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  timer.status === "running" ? "animate-pulse-soft" : ""
                }`}
                style={{ backgroundColor: ringColor }}
              />
              <span
                className="font-display text-[clamp(1rem,5cqw,2rem)] font-bold uppercase leading-none tracking-[0.12em]"
                style={{ color: ringColor }}
                aria-live="polite"
              >
                {phaseLabel}
              </span>
            </div>
            <TimeDisplay
              milliseconds={timer.phaseRemainingMs}
              muted={timer.status === "complete"}
            />
            <p className="mt-[clamp(0.65rem,2.5cqw,1.4rem)] font-display text-[clamp(0.72rem,3cqw,1rem)] font-semibold uppercase tracking-[0.1em] text-zinc-400">
              {roundContext}
            </p>
          </CircularProgress>
          <div className="mt-2 w-full max-w-xl">
            <TimerControls
              status={timer.status}
              onStart={start}
              onPause={timer.pause}
              onReset={reset}
              startLabel="Start session"
              canStart={roundDurationMs > 0}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
