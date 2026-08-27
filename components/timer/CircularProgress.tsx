interface CircularProgressProps {
  progress: number;
  color?: string;
  children: React.ReactNode;
  label: string;
  surfaceColor?: string;
  trackColor?: string;
  solo?: boolean;
}

export function CircularProgress({
  progress,
  color = "#dcff52",
  children,
  label,
  surfaceColor = "#0b0d0f",
  trackColor = "rgba(255,255,255,0.08)",
  solo = false,
}: CircularProgressProps) {
  const radius = 45.5;
  const circumference = 2 * Math.PI * radius;
  const clampedProgress = Math.min(1, Math.max(0, progress));

  return (
    <div
      className={`timer-dial relative grid aspect-square max-w-full place-items-center [container-type:inline-size] ${solo ? "timer-dial--solo" : ""}`}
      role="meter"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clampedProgress * 100)}
    >
      <svg
        className="absolute inset-0 h-full w-full -rotate-90 overflow-visible"
        viewBox="0 0 100 100"
        aria-hidden="true"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth="2.1"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clampedProgress)}
          className="transition-[stroke-dashoffset,stroke] duration-150 ease-linear"
          style={{ filter: `drop-shadow(0 0 2.5px ${color}4d)` }}
        />
      </svg>
      <div
        className="relative z-10 flex h-[83%] w-[83%] flex-col items-center justify-center rounded-full border border-white/[0.045] px-2 text-center shadow-[0_14px_42px_rgba(0,0,0,0.34)] transition-colors duration-300 sm:px-4"
        style={{ backgroundColor: surfaceColor }}
      >
        {children}
      </div>
    </div>
  );
}
