"use client";

import { useState } from "react";
import { ContinuousRoundTimer } from "./timer/ContinuousRoundTimer";
import { CountdownTimer } from "./timer/CountdownTimer";
import { RoundTimer } from "./timer/RoundTimer";
import { Stopwatch } from "./timer/Stopwatch";

type Utility = "rounds" | "continuous" | "stopwatch" | "countdown";

const UTILITIES: { id: Utility; label: string; shortLabel: string }[] = [
  { id: "rounds", label: "Boxing rounds", shortLabel: "Rounds" },
  { id: "continuous", label: "Continuous rounds", shortLabel: "No rest" },
  { id: "stopwatch", label: "Stopwatch", shortLabel: "Watch" },
  { id: "countdown", label: "Countdown timer", shortLabel: "Timer" },
];

function LogoMark() {
  return (
    <span className="grid h-8 w-8 place-items-center rounded-lg border border-zinc-700 bg-[#111316] text-acid" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current">
        <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" strokeWidth="1.5" />
        <path d="M5 9h14M5 15h14" strokeWidth="1.5" />
      </svg>
    </span>
  );
}

function UtilityIcon({ utility }: { utility: Utility }) {
  if (utility === "continuous") {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" aria-hidden="true">
        <path d="M4.2 6.5A6 6 0 0 1 15.5 8M15.8 13.5A6 6 0 0 1 4.5 12" strokeWidth="1.7" strokeLinecap="round" />
        <path d="m14 5.5 1.8 2.6 1.8-2.6M6 14.5l-1.8-2.6-1.8 2.6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (utility === "stopwatch") {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" aria-hidden="true">
        <circle cx="10" cy="11" r="6" strokeWidth="1.7" />
        <path d="M8 2h4M10 5V2M14.5 6.5 16 5M10 8v3l2 1" strokeWidth="1.7" strokeLinecap="round" />
      </svg>
    );
  }
  if (utility === "countdown") {
    return (
      <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" aria-hidden="true">
        <circle cx="10" cy="10" r="7" strokeWidth="1.7" />
        <path d="M10 6v4H7" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4 fill-none stroke-current" aria-hidden="true">
      <path d="M4 5h12v10H4zM7 5v10M13 5v10" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}

export function TrainingTimerApp() {
  const [activeUtility, setActiveUtility] = useState<Utility>("rounds");

  return (
    <main className="mx-auto flex min-h-[100svh] w-full max-w-[100rem] flex-col px-2.5 py-2.5 sm:px-4 sm:py-3 lg:px-6">
      <header className="app-topbar flex min-w-0 items-center gap-2.5">
        <div className="flex shrink-0 items-center gap-2.5">
          <LogoMark />
          <p className="brand-copy hidden text-sm font-bold tracking-[-0.01em] text-white md:block">Corner</p>
        </div>
        <nav
          className="utility-nav ml-auto grid min-w-0 flex-1 grid-cols-4 rounded-xl border border-zinc-800/90 bg-[#0d0f11] p-1 md:max-w-3xl"
          aria-label="Training utilities"
        >
          {UTILITIES.map((utility) => {
            const active = activeUtility === utility.id;
            return (
              <button
                key={utility.id}
                type="button"
                onClick={() => setActiveUtility(utility.id)}
                aria-label={utility.label}
                aria-current={active ? "page" : undefined}
                className={`relative flex min-h-11 min-w-0 items-center justify-center gap-1 rounded-lg px-1 py-2 text-[0.62rem] font-semibold tracking-[-0.01em] transition-colors sm:gap-1.5 sm:px-2 sm:text-[0.72rem] ${
                  active
                    ? "bg-[#24272b] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.045)]"
                    : "text-zinc-500 hover:bg-[#17191c] hover:text-zinc-200"
                }`}
              >
                <UtilityIcon utility={utility.id} />
                <span className="sm:hidden">{utility.shortLabel}</span>
                <span className="hidden sm:inline">{utility.label}</span>
              </button>
            );
          })}
        </nav>
      </header>

      <div className="app-content mt-2.5 flex-1 p-0.5 sm:mt-3 sm:p-2 lg:p-3">
        {activeUtility === "rounds" ? <RoundTimer /> : null}
        {activeUtility === "continuous" ? <ContinuousRoundTimer /> : null}
        {activeUtility === "stopwatch" ? <Stopwatch /> : null}
        {activeUtility === "countdown" ? <CountdownTimer /> : null}
      </div>
    </main>
  );
}
