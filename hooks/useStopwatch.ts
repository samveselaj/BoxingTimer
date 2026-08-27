"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { calculateElapsedMs } from "@/lib/timeline";
import type { TimerStatus } from "@/types/timer";

export function useStopwatch() {
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [elapsedMs, setElapsedMs] = useState(0);
  const statusRef = useRef<TimerStatus>("idle");
  const startedAtRef = useRef(0);
  const accumulatedRef = useRef(0);
  const frameRef = useRef<number | null>(null);

  const stopFrame = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  const runFrameLoop = useCallback(() => {
    const animate = () => {
      if (statusRef.current !== "running") return;
      setElapsedMs(
        calculateElapsedMs(accumulatedRef.current, startedAtRef.current, performance.now()),
      );
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
  }, []);

  const start = useCallback(() => {
    if (statusRef.current === "running") return;
    startedAtRef.current = performance.now();
    statusRef.current = "running";
    setStatus("running");
    stopFrame();
    runFrameLoop();
  }, [runFrameLoop, stopFrame]);

  const pause = useCallback(() => {
    if (statusRef.current !== "running") return;
    accumulatedRef.current = calculateElapsedMs(
      accumulatedRef.current,
      startedAtRef.current,
      performance.now(),
    );
    setElapsedMs(accumulatedRef.current);
    statusRef.current = "paused";
    setStatus("paused");
    stopFrame();
  }, [stopFrame]);

  const reset = useCallback(() => {
    stopFrame();
    accumulatedRef.current = 0;
    statusRef.current = "idle";
    setElapsedMs(0);
    setStatus("idle");
  }, [stopFrame]);

  useEffect(() => stopFrame, [stopFrame]);

  return { status, elapsedMs, start, pause, reset };
}
