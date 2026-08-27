import type { TimerStatus } from "@/types/timer";

interface TimerControlsProps {
  status: TimerStatus;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  startLabel?: string;
  canStart?: boolean;
}

function PlayIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M5.5 3.6a1 1 0 0 1 1.52-.85l10 6.4a1 1 0 0 1 0 1.7l-10 6.4a1 1 0 0 1-1.52-.85V3.6Z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-current" aria-hidden="true">
      <path d="M4.5 3.5A1.5 1.5 0 0 1 6 2h1a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 7 18H6a1.5 1.5 0 0 1-1.5-1.5v-13Zm7 0A1.5 1.5 0 0 1 13 2h1a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 14 18h-1a1.5 1.5 0 0 1-1.5-1.5v-13Z" />
    </svg>
  );
}

function ResetIcon() {
  return (
    <svg viewBox="0 0 20 20" className="h-5 w-5 fill-none stroke-current" aria-hidden="true">
      <path d="M4.2 5.1A7 7 0 1 1 3 12" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3.5 2.7v3.7h3.7" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TimerControls({
  status,
  onStart,
  onPause,
  onReset,
  startLabel = "Start",
  canStart = true,
}: TimerControlsProps) {
  const isRunning = status === "running";
  const primaryLabel =
    status === "paused" ? "Resume" : status === "complete" ? "Start again" : startLabel;

  return (
    <div className="timer-actions grid w-full grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-center">
      <button
        type="button"
        onClick={isRunning ? onPause : onStart}
        disabled={!isRunning && !canStart}
        className="inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-full bg-acid px-4 py-3 text-[0.78rem] font-bold tracking-[-0.005em] text-[#101204] transition-[background-color,transform] hover:bg-[#e7ff76] active:scale-[0.985] active:bg-[#caef40] disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-600 sm:w-auto sm:min-w-52 sm:px-7 sm:text-[0.82rem]"
      >
        {isRunning ? <PauseIcon /> : <PlayIcon />}
        {isRunning ? "Pause" : primaryLabel}
      </button>
      <button
        type="button"
        onClick={onReset}
        disabled={status === "idle"}
        className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full border border-zinc-700 bg-[#15171a] px-3 py-3 text-[0.72rem] font-semibold tracking-[-0.005em] text-zinc-200 transition-[background-color,border-color,transform] hover:border-zinc-500 hover:bg-[#1b1d20] active:scale-[0.985] disabled:cursor-not-allowed disabled:opacity-30 sm:w-auto sm:min-w-32 sm:px-5"
      >
        <ResetIcon />
        Reset
      </button>
    </div>
  );
}
