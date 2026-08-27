export type TimerStatus = "idle" | "running" | "paused" | "complete";

export type TimerPhaseKind = "round" | "rest" | "countdown";

export interface TimerPhase {
  id: string;
  kind: TimerPhaseKind;
  durationMs: number;
  round?: number;
}

export interface TimelineSnapshot {
  status: TimerStatus;
  elapsedMs: number;
  remainingMs: number;
  phaseIndex: number;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
  progress: number;
}
