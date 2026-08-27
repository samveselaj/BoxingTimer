"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildBoundaries,
  calculateElapsedMs,
  countBoundariesAtOrBefore,
  resolveTimelinePosition,
} from "@/lib/timeline";
import type { TimelineSnapshot, TimerPhase, TimerStatus } from "@/types/timer";

interface TimelineOptions {
  onBoundary?: (completedPhase: TimerPhase, nextPhase: TimerPhase | null) => void;
}

export function useTimelineTimer(phases: TimerPhase[], options: TimelineOptions = {}) {
  const boundaries = useMemo(() => buildBoundaries(phases), [phases]);
  const totalDurationMs = boundaries.at(-1) ?? 0;
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const frameRef = useRef<number | null>(null);
  const startedAtRef = useRef(0);
  const accumulatedRef = useRef(0);
  const crossedBoundaryRef = useRef(0);
  const statusRef = useRef<TimerStatus>("idle");
  const onBoundaryRef = useRef(options.onBoundary);

  useEffect(() => {
    onBoundaryRef.current = options.onBoundary;
  }, [options.onBoundary]);

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
  }, []);

  const processBoundaries = useCallback(
    (elapsed: number) => {
      const crossedCount = countBoundariesAtOrBefore(boundaries, elapsed);
      while (crossedBoundaryRef.current < crossedCount) {
        const completedIndex = crossedBoundaryRef.current;
        crossedBoundaryRef.current += 1;
        onBoundaryRef.current?.(
          phases[completedIndex],
          phases[completedIndex + 1] ?? null,
        );
      }
    },
    [boundaries, phases],
  );

  const runFrameLoop = useCallback(() => {
    const animate = () => {
      if (statusRef.current !== "running") return;

      const nextElapsed = calculateElapsedMs(
        accumulatedRef.current,
        startedAtRef.current,
        performance.now(),
        totalDurationMs,
      );
      processBoundaries(nextElapsed);
      setElapsedMs(nextElapsed);

      if (nextElapsed >= totalDurationMs) {
        accumulatedRef.current = totalDurationMs;
        statusRef.current = "complete";
        setStatus("complete");
        frameRef.current = null;
        return;
      }

      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
  }, [processBoundaries, totalDurationMs]);

  const start = useCallback(() => {
    if (totalDurationMs <= 0 || statusRef.current === "running") return;
    if (statusRef.current === "complete") {
      accumulatedRef.current = 0;
      crossedBoundaryRef.current = 0;
      setElapsedMs(0);
    }
    startedAtRef.current = performance.now();
    statusRef.current = "running";
    setStatus("running");
    stopFrame();
    runFrameLoop();
  }, [runFrameLoop, stopFrame, totalDurationMs]);

  const pause = useCallback(() => {
    if (statusRef.current !== "running") return;
    const nextElapsed = calculateElapsedMs(
      accumulatedRef.current,
      startedAtRef.current,
      performance.now(),
      totalDurationMs,
    );
    processBoundaries(nextElapsed);
    accumulatedRef.current = nextElapsed;
    setElapsedMs(nextElapsed);
    if (nextElapsed >= totalDurationMs) {
      statusRef.current = "complete";
      setStatus("complete");
      stopFrame();
      return;
    }
    statusRef.current = "paused";
    setStatus("paused");
    stopFrame();
  }, [processBoundaries, stopFrame, totalDurationMs]);

  const reset = useCallback(() => {
    stopFrame();
    accumulatedRef.current = 0;
    crossedBoundaryRef.current = 0;
    statusRef.current = "idle";
    setElapsedMs(0);
    setStatus("idle");
  }, [stopFrame]);

  useEffect(() => {
    // Configuration changes define a new timeline and intentionally reset it.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    reset();
  }, [phases, reset]);

  useEffect(() => {
    const syncAfterVisibilityChange = () => {
      if (document.visibilityState === "visible" && statusRef.current === "running") {
        stopFrame();
        runFrameLoop();
      }
    };
    document.addEventListener("visibilitychange", syncAfterVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", syncAfterVisibilityChange);
      stopFrame();
    };
  }, [runFrameLoop, stopFrame]);

  const position = useMemo(
    () => resolveTimelinePosition(phases, boundaries, elapsedMs, status === "complete"),
    [boundaries, elapsedMs, phases, status],
  );

  const snapshot: TimelineSnapshot = {
    status,
    elapsedMs,
    remainingMs: Math.max(0, totalDurationMs - elapsedMs),
    ...position,
  };

  return { ...snapshot, start, pause, reset, totalDurationMs };
}
