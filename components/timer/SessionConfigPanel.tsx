interface SessionConfigPanelProps {
  title: string;
  editable: boolean;
  summary: string;
  children: React.ReactNode;
  error?: string;
}
export function SessionConfigPanel({title, editable, summary, children, error}: SessionConfigPanelProps) {
  return <aside className="training-config">
    <div className="panel-heading"><span className="eyebrow">{title === "Duration" ? "Countdown setup" : "Session setup"}</span><h2>{editable ? (title === "Duration" ? "Set your time" : "Build your round") : "Current session"}</h2></div>
    {editable ? <div className="config-fields">{children}</div> : <div className="session-summary"><span className="eyebrow">Configured session</span><p>{summary}</p><span>Reset to edit your session.</span></div>}
    {error ? <p className="config-error" role="alert">{error}</p> : null}
    <div className="panel-footer"><span className="status-dot" />{editable ? "Ready when you are" : "Session in progress"}</div>
  </aside>;
}
