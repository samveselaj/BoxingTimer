interface ToolHeaderProps {
  title: string;
  description: string;
}

export function ToolHeader({ title, description }: ToolHeaderProps) {
  return (
    <header className="tool-header mb-2.5 flex items-center justify-between border-b border-zinc-800/80 pb-2.5 sm:mb-3 sm:pb-3">
      <h1 className="font-display text-lg font-semibold tracking-[-0.025em] text-zinc-100 sm:text-xl">
        {title}
      </h1>
      <p className="sr-only">{description}</p>
    </header>
  );
}
