"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Spinner } from "@/components/ui/spinner";
import {
  CONTENT_TYPES,
  CRYPTO_ASSETS,
  INVESTOR_TYPES,
} from "@/lib/constants";
import { preferencesSchema } from "@/lib/validations";
import type { ContentType, CryptoAsset, InvestorType } from "@/types";

function toggleValue<T extends string>(list: T[], value: T): T[] {
  return list.includes(value)
    ? list.filter((item) => item !== value)
    : [...list, value];
}

export function OnboardingQuiz() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [assets, setAssets] = useState<CryptoAsset[]>(["BTC", "ETH"]);
  const [investorType, setInvestorType] = useState<InvestorType>("HODLer");
  const [contentTypes, setContentTypes] = useState<ContentType[]>([
    "Market News",
    "Charts/Prices",
  ]);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const canContinue = useMemo(() => {
    if (step === 0) return assets.length > 0;
    if (step === 1) return Boolean(investorType);
    return contentTypes.length > 0;
  }, [assets, contentTypes, investorType, step]);

  async function finish() {
    if (pending) return;
    setError(null);

    const parsed = preferencesSchema.safeParse({
      assets,
      investorType,
      contentTypes,
    });
    if (!parsed.success) {
      setError(parsed.error.issues.map((i) => i.message).join(", "));
      return;
    }

    setPending(true);
    try {
      const response = await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Could not save preferences");
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save");
      setPending(false);
    }
  }

  const choiceButtonClass = (active: boolean) =>
    `rounded-lg border px-3 py-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
      active
        ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100"
        : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
    }`;

  return (
    <div
      className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-950/80 p-6 md:p-8"
      aria-busy={pending}
    >
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
          Onboarding
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-50 md:text-3xl">
          Personalize your daily desk
        </h1>
        <p className="mt-2 text-sm text-slate-400" id="onboarding-step-label">
          Step {step + 1} of 3 — we use this to rank news, prices, and AI
          insights.
        </p>
        <div
          className="mt-4 h-1.5 overflow-hidden rounded-full bg-slate-800"
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={3}
          aria-valuenow={step + 1}
          aria-label="Onboarding progress"
        >
          <div
            className="h-full rounded-full bg-cyan-400 transition-all"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {step === 0 && (
        <fieldset disabled={pending} className="border-0 p-0">
          <legend className="text-lg font-medium text-slate-100">
            Which assets interest you?
          </legend>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {CRYPTO_ASSETS.map((asset) => {
              const active = assets.includes(asset.symbol);
              return (
                <button
                  key={asset.symbol}
                  type="button"
                  aria-pressed={active}
                  aria-label={`${asset.name} (${asset.symbol})`}
                  onClick={() =>
                    setAssets((prev) => toggleValue(prev, asset.symbol))
                  }
                  className={choiceButtonClass(active)}
                >
                  <div className="text-sm font-semibold">{asset.symbol}</div>
                  <div className="text-xs opacity-70">{asset.name}</div>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {step === 1 && (
        <fieldset disabled={pending} className="border-0 p-0">
          <legend className="text-lg font-medium text-slate-100">
            What kind of investor are you?
          </legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Investor type">
            {INVESTOR_TYPES.map((type) => {
              const active = investorType === type;
              return (
                <button
                  key={type}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setInvestorType(type)}
                  className={`rounded-lg border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
                    active
                      ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="font-medium">{type}</div>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {step === 2 && (
        <fieldset disabled={pending} className="border-0 p-0">
          <legend className="text-lg font-medium text-slate-100">
            Preferred content types?
          </legend>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {CONTENT_TYPES.map((type) => {
              const active = contentTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  aria-pressed={active}
                  onClick={() =>
                    setContentTypes((prev) => toggleValue(prev, type))
                  }
                  className={`rounded-lg border px-4 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 ${
                    active
                      ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-100"
                      : "border-slate-700 bg-slate-900 text-slate-300 hover:border-slate-500"
                  }`}
                >
                  <div className="font-medium">{type}</div>
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {error && (
        <p className="mt-4 text-sm text-rose-400" role="alert">
          {error}
        </p>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          disabled={step === 0 || pending}
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:opacity-40"
        >
          Back
        </button>
        {step < 2 ? (
          <button
            type="button"
            disabled={!canContinue || pending}
            onClick={() => setStep((s) => s + 1)}
            className="rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:opacity-40"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            disabled={!canContinue || pending}
            onClick={finish}
            aria-disabled={!canContinue || pending}
            className="inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {pending && <Spinner className="h-4 w-4" label="Saving preferences" />}
            {pending ? "Saving..." : "Go to dashboard"}
          </button>
        )}
      </div>
    </div>
  );
}
