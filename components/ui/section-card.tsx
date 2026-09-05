interface SectionCardProps {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}

export function SectionCard({
  title,
  subtitle,
  badge,
  children,
}: SectionCardProps) {
  return (
    <section className="rounded-xl border border-slate-800/80 bg-slate-950/70 p-5 shadow-[0_0_0_1px_rgba(15,23,42,0.4)] backdrop-blur">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-slate-50">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
        {badge && (
          <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-cyan-300">
            {badge}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}
