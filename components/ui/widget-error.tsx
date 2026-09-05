import type { ReactNode } from "react";
import { Inbox } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";

interface WidgetErrorProps {
  title?: string;
  message: string;
}

export function WidgetError({
  title = "Something went wrong",
  message,
}: WidgetErrorProps) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-4 py-3"
    >
      <p className="text-sm font-medium text-rose-300">{title}</p>
      <p className="mt-1 text-sm text-rose-200/80">{message}</p>
    </div>
  );
}

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
}

export function EmptyState({ title, description, icon }: EmptyStateProps) {
  return (
    <div
      role="status"
      className="flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-900/40 px-6 py-10 text-center"
    >
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-slate-700 bg-slate-950 text-cyan-300">
        {icon ?? <Inbox className="h-5 w-5" aria-hidden />}
      </div>
      <p className="text-sm font-medium text-slate-100">{title}</p>
      <p className="mt-1 max-w-sm text-sm leading-relaxed text-slate-400">
        {description}
      </p>
    </div>
  );
}

interface SectionFallbackProps {
  title: string;
  subtitle: string;
  rows?: number;
}

export function SectionFallback({
  title,
  subtitle,
  rows = 4,
}: SectionFallbackProps) {
  return (
    <SectionCard title={title} subtitle={subtitle} badge="Loading">
      <div className="space-y-3" aria-busy="true" aria-live="polite">
        {Array.from({ length: rows }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-md bg-slate-800/80"
            aria-hidden
          />
        ))}
        <span className="sr-only">Loading {title}</span>
      </div>
    </SectionCard>
  );
}
