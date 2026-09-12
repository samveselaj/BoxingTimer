'use client'

import { useEffect, useMemo, useState } from 'react'

type Mode = 'boxing' | 'continuous' | 'stopwatch' | 'countdown'
type Phase = 'work' | 'rest' | 'finished'

const modeLabels: Record<Mode, string> = {
  boxing: 'BOXING ROUNDS',
  continuous: 'CONTINUOUS',
  stopwatch: 'STOPWATCH',
  countdown: 'COUNTDOWN',
}

const formatTime = (seconds: number, tenths = false) => {
  const safe = Math.max(0, seconds)
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0')
  const remainder = Math.floor(safe % 60).toString().padStart(2, '0')
  return tenths ? `${minutes}:${remainder}.${Math.floor((safe % 1) * 10)}` : `${minutes}:${remainder}`
}

const BellIcon = () => <span aria-hidden="true" className="icon">⌁</span>
const GearIcon = () => <span aria-hidden="true" className="icon gear">⚙</span>

export default function Page() {
  const [mode, setMode] = useState<Mode>('boxing')
  const [rounds, setRounds] = useState(10)
  const [work, setWork] = useState(180)
  const [rest, setRest] = useState(60)
  const [countdown, setCountdown] = useState(300)
  const [elapsed, setElapsed] = useState(0)
  const [remaining, setRemaining] = useState(180)
  const [round, setRound] = useState(1)
  const [phase, setPhase] = useState<Phase>('work')
  const [running, setRunning] = useState(false)
  const [sound, setSound] = useState(true)

  const isSession = running || elapsed > 0 || phase === 'finished'
  const duration = mode === 'boxing' ? (phase === 'rest' ? rest : work) : mode === 'countdown' ? countdown : 0
  const progress = mode === 'stopwatch' || mode === 'continuous' ? 0 : duration ? Math.min(1, remaining / duration) : 0
  const display = mode === 'stopwatch' || mode === 'continuous' ? formatTime(elapsed, mode === 'stopwatch') : formatTime(remaining)

  const modeSubhead = useMemo(() => {
    if (mode === 'boxing') return `${rounds} ROUNDS  •  ${formatTime(work)} WORK  •  ${formatTime(rest)} REST`
    if (mode === 'countdown') return `${formatTime(countdown)} COUNTDOWN`
    return 'TIME RUNS UPWARD'
  }, [mode, rounds, work, rest, countdown])

  useEffect(() => {
    if (!running) return
    const timer = window.setInterval(() => {
      if (mode === 'stopwatch' || mode === 'continuous') {
        setElapsed((value) => value + 0.1)
        return
      }
      setRemaining((value) => {
        if (value > 0.1) return value - 0.1
        if (mode === 'countdown') {
          setRunning(false)
          setPhase('finished')
          return 0
        }
        if (phase === 'work' && rest > 0) {
          setPhase('rest')
          return rest
        }
        if (round >= rounds) {
          setRunning(false)
          setPhase('finished')
          return 0
        }
        setRound((value) => value + 1)
        setPhase('work')
        return work
      })
    }, 100)
    return () => window.clearInterval(timer)
  }, [running, mode, phase, rest, round, rounds, work])

  const start = () => {
    if (phase === 'finished') reset()
    setRunning(true)
  }

  const reset = () => {
    setRunning(false)
    setElapsed(0)
    setRound(1)
    setPhase('work')
    setRemaining(mode === 'boxing' ? work : countdown)
  }

  const selectMode = (next: Mode) => {
    setMode(next)
    setRunning(false)
    setElapsed(0)
    setRound(1)
    setPhase('work')
    setRemaining(next === 'boxing' ? work : countdown)
  }

  const updateWork = (value: number) => { setWork(value); if (!isSession && mode === 'boxing') setRemaining(value) }
  const updateCountdown = (value: number) => { setCountdown(value); if (!isSession && mode === 'countdown') setRemaining(value) }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">+</span><span>CORNER</span><small>BOXING TIMER</small></div>
        <div className="top-actions">
          <button className={`sound-button ${sound ? 'is-on' : ''}`} onClick={() => setSound(!sound)} aria-label={sound ? 'Mute bell' : 'Enable bell'}><BellIcon /></button>
          <button className="reset-top" onClick={reset}><span aria-hidden="true">↻</span> RESET</button>
        </div>
      </header>

      <section className="mode-nav" aria-label="Timer modes">
        {(Object.keys(modeLabels) as Mode[]).map((item) => <button key={item} className={mode === item ? 'active' : ''} onClick={() => selectMode(item)}>{modeLabels[item]}</button>)}
      </section>

      <div className="workspace">
        <section className={`timer-card phase-${phase} ${running ? 'is-running' : ''}`}>
          <div className="phase-label"><span className="phase-dot" /> {phase === 'finished' ? 'SESSION COMPLETE' : mode === 'boxing' ? (phase === 'rest' ? 'REST' : 'WORK') : modeLabels[mode]}</div>
          <div className="timer-face">
            <div className="progress-ring" style={{ '--progress': `${progress * 360}deg` } as React.CSSProperties}><div className="timer-center"><div className="timer-value">{display}</div><div className="timer-unit">{mode === 'stopwatch' ? 'ELAPSED' : phase === 'rest' ? 'RECOVERY' : phase === 'finished' ? 'DONE' : 'REMAINING'}</div></div></div>
          </div>
          <div className="round-readout">{mode === 'boxing' ? <><strong>ROUND {Math.min(round, rounds)}</strong><span>/ {rounds}</span></> : <><strong>{mode === 'countdown' ? 'COUNTDOWN' : 'OPEN TIMER'}</strong></>}</div>
          <p className="mode-subhead">{phase === 'finished' ? 'GOOD WORK. RESET WHEN YOU’RE READY.' : modeSubhead}</p>
          <div className="timer-actions"><button className="action-button" onClick={() => running ? setRunning(false) : start()}>{running ? 'PAUSE' : phase === 'finished' ? 'RESTART' : isSession ? 'RESUME' : 'START'}</button><button className="reset-button" onClick={reset}>RESET</button></div>
        </section>

        <aside className="settings-panel">
          <div className="panel-heading"><div><span className="eyebrow">SESSION SETUP</span><h2>{isSession ? 'CURRENT SESSION' : 'BUILD YOUR ROUND'}</h2></div><GearIcon /></div>
          {isSession ? <div className="summary-list"><Summary label="MODE" value={modeLabels[mode]} /><Summary label="ROUNDS" value={mode === 'boxing' ? `${rounds} ROUNDS` : 'OPEN'} /><Summary label="WORK" value={mode === 'boxing' ? formatTime(work) : '—'} /><Summary label="REST" value={mode === 'boxing' ? formatTime(rest) : '—'} /></div> : <div className="settings-form">
            {mode === 'boxing' && <><SettingRow label="ROUNDS"><NumberControl value={rounds} min={1} max={99} onChange={setRounds} suffix="ROUNDS" /></SettingRow><SettingRow label="WORK TIME"><NumberControl value={work} min={10} max={3600} step={10} onChange={updateWork} display={formatTime(work)} /></SettingRow><SettingRow label="REST TIME"><NumberControl value={rest} min={0} max={3600} step={10} onChange={setRest} display={formatTime(rest)} /></SettingRow></>}
            {mode === 'countdown' && <SettingRow label="COUNTDOWN"><NumberControl value={countdown} min={10} max={3600} step={10} onChange={updateCountdown} display={formatTime(countdown)} /></SettingRow>}
            {(mode === 'continuous' || mode === 'stopwatch') && <div className="open-note">No setup needed.<br /><span>Hit start when you’re ready to work.</span></div>}
          </div>}
          <div className="panel-footer"><span><span className={`status-dot ${running ? 'live' : ''}`} /> {running ? 'TIMER RUNNING' : phase === 'finished' ? 'SESSION COMPLETE' : 'READY TO START'}</span><span className="keyboard-hint">SPACE TO START</span></div>
        </aside>
      </div>
      <footer className="footer-note"><span>TRAIN WITH INTENTION.</span><span>BUILT FOR THE ROUNDS AHEAD.</span></footer>
    </main>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) { return <div className="setting-row"><label>{label}</label>{children}</div> }
function NumberControl({ value, min, max, step = 1, onChange, suffix, display }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void; suffix?: string; display?: string }) { return <div className="number-control"><button onClick={() => onChange(Math.max(min, value - step))} aria-label={`Decrease ${suffix ?? 'value'}`}>−</button><strong>{display ?? value}</strong>{suffix && <span>{suffix}</span>}<button onClick={() => onChange(Math.min(max, value + step))} aria-label={`Increase ${suffix ?? 'value'}`}>+</button></div> }
function Summary({ label, value }: { label: string; value: string }) { return <div className="summary-row"><span>{label}</span><strong>{value}</strong></div> }
