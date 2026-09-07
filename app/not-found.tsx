import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
        Moveo Crypto Advisor
      </p>
      <h1 className="mt-3 text-2xl font-semibold text-slate-50">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-400">
        The page you requested does not exist or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
      >
        Back to home
      </Link>
    </main>
  );
}
