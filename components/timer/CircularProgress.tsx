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
  color = "#d8e2e8",
  children,
  label,
  surfaceColor = "#101214",
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
          strokeWidth="0.45"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="0.65"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clampedProgress)}
          className="transition-[stroke-dashoffset,stroke] duration-150 ease-linear"
        />
      </svg>
      <div
        className="timer-center"
        style={{ backgroundColor: surfaceColor }}
      >
        {children}
      </div>
    </div>
  );
}
