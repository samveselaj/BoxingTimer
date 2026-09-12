"use client";
import { useStopwatch } from "@/hooks/useStopwatch";
import { formatStopwatch, MINUTE_MS } from "@/lib/time";
import { TimerStage } from "./TimerStage";
export function Stopwatch() {
  const stopwatch = useStopwatch();
  const time = formatStopwatch(stopwatch.elapsedMs);
  return <section className="training-layout stopwatch-layout" aria-label="Stopwatch">
    <aside className="training-config"><div className="panel-heading"><span className="eyebrow">Open training</span><h2>Find your rhythm</h2></div><p className="open-note">No rounds. No countdown.<br /><span>Start the clock and make the time yours.</span></p><div className="panel-footer"><span className="status-dot" />Minutes · seconds · hundredths</div></aside>
    <TimerStage status={stopwatch.status} phase={stopwatch.status === "running" ? "Running" : "Ready"} context="Stopwatch" summary="Your session, at your pace" progress={(stopwatch.elapsedMs % MINUTE_MS) / MINUTE_MS} onStart={stopwatch.start} onPause={stopwatch.pause} onReset={stopwatch.reset} elapsed>
      <div className="stopwatch-display"><time className="time-digits">{time.main}</time><span className="time-fraction">{time.fraction}</span></div>
    </TimerStage>
  </section>;
}
