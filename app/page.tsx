import Link from "next/link";
import {
  ArrowRight,
  BrainCircuit,
  ChartCandlestick,
  Newspaper,
} from "lucide-react";
import { redirect } from "next/navigation";
import { getSessionFromCookies } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const session = await getSessionFromCookies();
  if (session) {
    let hasPreferences = false;
    try {
      const preference = await prisma.userPreference.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      });
      hasPreferences = Boolean(preference);
    } catch (error) {
      console.error("home preference query failed", error);
      redirect("/dashboard");
    }
    redirect(hasPreferences ? "/dashboard" : "/onboarding");
  }

  return (
    <main className="relative flex flex-1 flex-col overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(30,41,59,0.35)_1px,transparent_1px),linear-gradient(to_bottom,rgba(30,41,59,0.35)_1px,transparent_1px)] bg-[size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-[0.28em] text-cyan-400">
          Moveo Crypto Advisor
        </p>
        <h1 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-tight text-slate-50 md:text-6xl">
          Your daily AI desk for crypto decisions
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-slate-400 md:text-lg">
          Personalized prices, curated news, investor-specific AI insights, and
          a daily meme — with feedback loops built for model fine-tuning.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
          >
            Get started
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center rounded-lg border border-slate-700 px-5 py-3 text-sm font-medium text-slate-200 hover:border-slate-500"
          >
            Sign in
          </Link>
        </div>

        <div className="mt-14 grid gap-4 md:grid-cols-3">
          {[
            {
              icon: ChartCandlestick,
              title: "Live prices",
              copy: "Track your watchlist with 24h momentum.",
            },
            {
              icon: Newspaper,
              title: "Asset-aware news",
              copy: "Headlines ranked around coins you actually hold interest in.",
            },
            {
              icon: BrainCircuit,
              title: "AI insight + votes",
              copy: "Daily playbooks with thumbs up/down for alignment data.",
            },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-xl border border-slate-800 bg-slate-950/60 p-5"
            >
              <item.icon className="h-5 w-5 text-cyan-300" />
              <h2 className="mt-3 font-medium text-slate-100">{item.title}</h2>
              <p className="mt-1 text-sm text-slate-400">{item.copy}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
