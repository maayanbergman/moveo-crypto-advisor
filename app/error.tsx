"use client";

import Link from "next/link";
import { useEffect } from "react";
import { logger } from "@/lib/logger";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    logger.error("app.global_error", error, { digest: error.digest });
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
        Moveo Crypto Advisor
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-50">
        Something went wrong
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        An unexpected error occurred. You can try again or return home.
      </p>
      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Try again
        </button>
        <Link
          href="/"
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:border-slate-500"
        >
          Go home
        </Link>
      </div>
    </main>
  );
}
