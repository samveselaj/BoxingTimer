interface SessionConfigPanelProps {
  title: string;
  editable: boolean;
  summary: string;
  children: React.ReactNode;
  error?: string;
}

export function SessionConfigPanel({
  title,
  editable,
  summary,
  children,
  error,
}: SessionConfigPanelProps) {
  return (
    <aside className="training-config order-1 rounded-xl border border-zinc-800/90 bg-[#101214] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.02)] lg:p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h2 className="text-xs font-semibold text-zinc-300">{title}</h2>
        {!editable ? (
          <span className="flex items-center gap-1.5 text-[0.62rem] font-medium text-zinc-500">
            <span className="h-1.5 w-1.5 rounded-full bg-acid" aria-hidden="true" />
            Active
          </span>
        ) : null}
      </div>
      {editable ? (
        children
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-[#16181b] px-3 py-2.5" aria-live="polite">
          <p className="truncate font-mono text-xs font-medium tabular-nums text-zinc-200">
            {summary}
          </p>
        </div>
      )}
      {error ? <p className="mt-2 text-[0.68rem] font-medium text-danger">{error}</p> : null}
    </aside>
  );
}
