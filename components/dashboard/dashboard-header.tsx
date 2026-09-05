import { Settings2 } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "@/components/dashboard/logout-button";

interface DashboardHeaderProps {
  name: string;
  investorType?: string;
  assets?: string[];
}

export function DashboardHeader({
  name,
  investorType,
  assets = [],
}: DashboardHeaderProps) {
  return (
    <header className="mb-8 flex flex-col gap-4 border-b border-slate-800 pb-6 md:flex-row md:items-center md:justify-between">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-400">
          Moveo Crypto Advisor
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50 md:text-3xl">
          Good to see you, {name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-slate-400">
          {investorType ? `${investorType} desk` : "Your daily desk"}
          {assets.length > 0 ? ` · Watching ${assets.join(", ")}` : ""}
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/onboarding"
          aria-label="Edit investment preferences"
          className="inline-flex items-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:border-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
        >
          <Settings2 className="h-4 w-4" aria-hidden />
          Preferences
        </Link>
        <LogoutButton />
      </div>
    </header>
  );
}
