import assert from "node:assert/strict";
import test from "node:test";
import {
  buildBoundaries,
  calculateElapsedMs,
  countBoundariesAtOrBefore,
  resolveTimelinePosition,
} from "../lib/timeline.js";
import type { TimerPhase } from "../types/timer.js";

const roundSequence: TimerPhase[] = [
  { id: "round-1", kind: "round", durationMs: 3_000, round: 1 },
  { id: "rest-1", kind: "rest", durationMs: 1_000, round: 1 },
  { id: "round-2", kind: "round", durationMs: 3_000, round: 2 },
];
const roundBoundaries = buildBoundaries(roundSequence);

test("round, rest, next round, and final completion resolve at exact boundaries", () => {
  assert.deepEqual(roundBoundaries, [3_000, 4_000, 7_000]);
  assert.deepEqual(resolveTimelinePosition(roundSequence, roundBoundaries, 2_999, false), {
    phaseIndex: 0,
    phaseElapsedMs: 2_999,
    phaseRemainingMs: 1,
    progress: 2_999 / 3_000,
  });
  assert.deepEqual(resolveTimelinePosition(roundSequence, roundBoundaries, 3_000, false), {
    phaseIndex: 1,
    phaseElapsedMs: 0,
    phaseRemainingMs: 1_000,
    progress: 0,
  });
  assert.deepEqual(resolveTimelinePosition(roundSequence, roundBoundaries, 4_000, false), {
    phaseIndex: 2,
    phaseElapsedMs: 0,
    phaseRemainingMs: 3_000,
    progress: 0,
  });
  assert.deepEqual(resolveTimelinePosition(roundSequence, roundBoundaries, 7_000, true), {
    phaseIndex: 2,
    phaseElapsedMs: 3_000,
    phaseRemainingMs: 0,
    progress: 1,
  });
});

test("delayed rendering catches up from the absolute timestamp without phase drift", () => {
  assert.equal(calculateElapsedMs(0, 10_000, 16_500, 7_000), 6_500);
  assert.equal(countBoundariesAtOrBefore(roundBoundaries, 6_500), 2);
  assert.deepEqual(resolveTimelinePosition(roundSequence, roundBoundaries, 6_500, false), {
    phaseIndex: 2,
    phaseElapsedMs: 2_500,
    phaseRemainingMs: 500,
    progress: 5 / 6,
  });
});

test("a boundary is counted once even when multiple frames observe the same timestamp", () => {
  const firstObservation = countBoundariesAtOrBefore(roundBoundaries, 3_000);
  assert.equal(firstObservation, 1);
  const processedBoundaryCount = firstObservation;
  const secondObservation = countBoundariesAtOrBefore(roundBoundaries, 3_000);
  assert.equal(secondObservation - processedBoundaryCount, 0);
});

test("each crossed round/rest boundary produces one event, including final completion", () => {
  let processedBoundaryCount = 0;
  const eventIndexes: number[] = [];

  for (const elapsed of [0, 3_000, 3_000, 4_000, 6_999, 7_000, 7_000]) {
    const crossedCount = countBoundariesAtOrBefore(roundBoundaries, elapsed);
    while (processedBoundaryCount < crossedCount) {
      eventIndexes.push(processedBoundaryCount);
      processedBoundaryCount += 1;
    }
  }

  assert.deepEqual(eventIndexes, [0, 1, 2]);
});

test("a delayed frame retains every crossed transition exactly once", () => {
  let processedBoundaryCount = 0;
  const eventIndexes: number[] = [];

  for (const elapsed of [0, 7_000, 7_000]) {
    const crossedCount = countBoundariesAtOrBefore(roundBoundaries, elapsed);
    while (processedBoundaryCount < crossedCount) {
      eventIndexes.push(processedBoundaryCount);
      processedBoundaryCount += 1;
    }
  }

  assert.deepEqual(eventIndexes, [0, 1, 2]);
});

test("continuous rounds advance directly and retain cumulative boundaries", () => {
  const phases: TimerPhase[] = Array.from({ length: 10 }, (_, index) => ({
    id: `round-${index + 1}`,
    kind: "round",
    durationMs: 180_000,
    round: index + 1,
  }));
  const boundaries = buildBoundaries(phases);
  assert.equal(boundaries.at(-1), 1_800_000);
  assert.equal(resolveTimelinePosition(phases, boundaries, 180_000, false).phaseIndex, 1);
  assert.equal(resolveTimelinePosition(phases, boundaries, 1_620_000, false).phaseIndex, 9);
});

test("countdown clamps to exactly zero after a delayed callback", () => {
  const elapsed = calculateElapsedMs(0, 50_000, 56_500, 5_000);
  assert.equal(elapsed, 5_000);
  assert.equal(countBoundariesAtOrBefore([5_000], elapsed), 1);
});

test("rapid pause and resume accumulation uses timestamps without losing time", () => {
  let accumulated = calculateElapsedMs(0, 0, 125);
  accumulated = calculateElapsedMs(accumulated, 200, 275);
  accumulated = calculateElapsedMs(accumulated, 300, 325);
  assert.equal(accumulated, 225);
});

test("reset discards paused accumulation", () => {
  const pausedElapsed = calculateElapsedMs(1_000, 5_000, 5_500);
  assert.equal(pausedElapsed, 1_500);
  assert.equal(calculateElapsedMs(0, 6_000, 6_000), 0);
});

test("a three-hour session has no callback-count drift", () => {
  const threeHours = 3 * 60 * 60 * 1_000;
  assert.equal(calculateElapsedMs(0, 1_000, threeHours + 1_000, threeHours), threeHours);
  assert.equal(calculateElapsedMs(0, 1_000, threeHours + 31_000, threeHours), threeHours);
});
