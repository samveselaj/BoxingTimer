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
  { id: "stopwatch", label: "Stopwatch", shortLabel: "Stopwatch" },
  { id: "countdown", label: "Countdown timer", shortLabel: "Countdown" },
];

export function TrainingTimerApp() {
  const [activeUtility, setActiveUtility] = useState<Utility>("rounds");

  return (
    <main className="app-shell">
      <header className="app-topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">+</span><span>CORNER</span><span className="brand-caption">BOXING TIMER</span></div>
        <span className="topbar-detail">YOUR TIME. YOUR PACE.</span>
      </header>
      <nav className="utility-nav" aria-label="Training utilities">
        {UTILITIES.map((utility) => (
          <button key={utility.id} type="button" onClick={() => setActiveUtility(utility.id)} aria-label={utility.label} aria-current={activeUtility === utility.id ? "page" : undefined}>
            <span className="nav-full">{utility.label}</span><span className="nav-short">{utility.shortLabel}</span>
          </button>
        ))}
      </nav>
      <div className="app-content">
        {activeUtility === "rounds" ? <RoundTimer /> : null}
        {activeUtility === "continuous" ? <ContinuousRoundTimer /> : null}
        {activeUtility === "stopwatch" ? <Stopwatch /> : null}
        {activeUtility === "countdown" ? <CountdownTimer /> : null}
      </div>
      <footer className="app-footer"><span>CORNER <span className="footer-divider">/</span> TRAINING TIMER</span><span>ONE ROUND AT A TIME.</span></footer>
    </main>
  );
}
