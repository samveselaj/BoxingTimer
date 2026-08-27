import type { TimerPhase } from "../types/timer.js";

export interface TimelinePosition {
  phaseIndex: number;
  phaseElapsedMs: number;
  phaseRemainingMs: number;
  progress: number;
}

export function buildBoundaries(phases: TimerPhase[]): number[] {
  let elapsed = 0;
  return phases.map((phase) => {
    elapsed += phase.durationMs;
    return elapsed;
  });
}

export function calculateElapsedMs(
  accumulatedMs: number,
  startedAtMs: number,
  nowMs: number,
  maximumMs = Number.POSITIVE_INFINITY,
): number {
  return Math.min(maximumMs, Math.max(0, accumulatedMs + nowMs - startedAtMs));
}

export function countBoundariesAtOrBefore(boundaries: number[], elapsedMs: number): number {
  let low = 0;
  let high = boundaries.length;

  while (low < high) {
    const middle = Math.floor((low + high) / 2);
    if (boundaries[middle] <= elapsedMs) low = middle + 1;
    else high = middle;
  }

  return low;
}

export function resolveTimelinePosition(
  phases: TimerPhase[],
  boundaries: number[],
  elapsedMs: number,
  complete: boolean,
): TimelinePosition {
  if (phases.length === 0) {
    return { phaseIndex: 0, phaseElapsedMs: 0, phaseRemainingMs: 0, progress: 0 };
  }

  const totalDurationMs = boundaries.at(-1) ?? 0;
  const phaseIndex =
    elapsedMs >= totalDurationMs
      ? phases.length - 1
      : countBoundariesAtOrBefore(boundaries, elapsedMs);
  const phaseStartMs = phaseIndex === 0 ? 0 : boundaries[phaseIndex - 1] ?? 0;
  const phaseDurationMs = phases[phaseIndex]?.durationMs ?? 0;
  const phaseElapsedMs = Math.max(0, Math.min(phaseDurationMs, elapsedMs - phaseStartMs));
  const phaseRemainingMs = complete ? 0 : Math.max(0, phaseDurationMs - phaseElapsedMs);
  const progress = phaseDurationMs > 0 ? Math.min(1, phaseElapsedMs / phaseDurationMs) : 0;

  return { phaseIndex, phaseElapsedMs, phaseRemainingMs, progress };
}
