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

  return (
    <section className="utility-view">
      <ToolHeader
        title="Continuous rounds"
        description="Back-to-back rounds with a bell at every boundary and no recovery phase."
      />
      <div className="training-layout grid items-start gap-2.5 lg:grid-cols-[22rem_minmax(0,1fr)] lg:gap-6">
        <SessionConfigPanel
          title="Session"
          editable={editable}
          summary={`${config.rounds} rounds · ${formatClock(phases[0]?.durationMs ?? 0)} each`}
        >
          <div className="config-grid grid grid-cols-3 gap-2">
            <NumberField
              label="Rounds"
              value={config.rounds}
              min={1}
              max={50}
              disabled={!editable}
              onChange={(value) => set("rounds", value)}
            />
            <NumberField
                label="Minutes"
                value={config.minutes}
                min={0}
                max={60}
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
            label="Continuous round progress"
            surfaceColor={timer.status === "complete" ? "#160e11" : "#11140c"}
            trackColor="rgba(220,255,82,0.12)"
          >
            <div className="mb-[clamp(0.55rem,2cqw,1.15rem)] flex items-center gap-2.5">
              <span
                className={`h-2.5 w-2.5 rounded-full bg-acid ${
                  timer.status === "running" ? "animate-pulse-soft" : ""
                }`}
              />
              <span className="font-display text-[clamp(1rem,5cqw,2rem)] font-bold uppercase leading-none tracking-[0.12em] text-acid" aria-live="polite">
                {timer.status === "complete" ? "Complete" : "Round"}
              </span>
            </div>
            <TimeDisplay
              milliseconds={timer.phaseRemainingMs}
              muted={timer.status === "complete"}
            />
            <p className="mt-[clamp(0.65rem,2.5cqw,1.4rem)] font-display text-[clamp(0.72rem,3cqw,1rem)] font-semibold uppercase tracking-[0.1em] text-zinc-400">
              {timer.status === "complete"
                ? `${config.rounds} rounds complete`
                : `Round ${phase?.round ?? 1} / ${config.rounds}`}
            </p>
          </CircularProgress>
          <div className="mt-2 w-full max-w-xl">
            <TimerControls
              status={timer.status}
              onStart={start}
              onPause={timer.pause}
              onReset={reset}
              startLabel="Start rounds"
              canStart={timer.totalDurationMs > 0}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
