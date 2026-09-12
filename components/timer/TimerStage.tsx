import type { TimerStatus } from "@/types/timer";
import { CircularProgress } from "./CircularProgress";
import { TimerControls } from "./TimerControls";

interface TimerStageProps {
  status: TimerStatus;
  phase: string;
  context: string;
  summary: string;
  progress: number;
  rest?: boolean;
  canStart?: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  children: React.ReactNode;
  elapsed?: boolean;
}
export function TimerStage({status, phase, context, summary, progress, rest, canStart, onStart, onPause, onReset, children, elapsed}: TimerStageProps) {
  const label = status === "paused" ? "Paused" : status === "complete" ? "Complete" : phase;
  return <div className={`training-stage ${rest ? "stage-rest" : ""}`}>
    <div className="phase-label" aria-live="polite"><span className="phase-dot" />{label}</div>
    <CircularProgress progress={elapsed ? progress : 1 - progress} color={rest ? "#c69b72" : "#d8e2e8"} label={`${phase} progress`}>
      {children}
      <span className="timer-unit">{status === "complete" ? "Session finished" : elapsed ? "Elapsed" : rest ? "Recovery remaining" : "Remaining"}</span>
    </CircularProgress>
    <p className="round-context">{context}</p>
    <p className="session-caption">{summary}</p>
    <TimerControls status={status} onStart={onStart} onPause={onPause} onReset={onReset} canStart={canStart} />
  </div>;
}
