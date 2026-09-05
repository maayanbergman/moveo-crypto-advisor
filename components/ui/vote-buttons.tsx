"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useState } from "react";
import type { FeedbackRating, FeedbackSection } from "@/types";

interface VoteButtonsProps {
  section: FeedbackSection;
  itemId?: string;
}

export function VoteButtons({ section, itemId }: VoteButtonsProps) {
  const [selected, setSelected] = useState<FeedbackRating | null>(null);
  const [locked, setLocked] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);

  async function vote(rating: FeedbackRating) {
    if (locked || pending) return;

    const previous = selected;
    setSelected(rating);
    setLocked(true);
    setPending(true);
    setError(null);
    setStatus(rating === "UP" ? "Marked as helpful" : "Marked as not helpful");

    try {
      const response = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section, rating, itemId }),
      });
      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? "Vote failed");
      }
    } catch (err) {
      setSelected(previous);
      setLocked(false);
      setStatus(null);
      setError(err instanceof Error ? err.message : "Vote failed");
    } finally {
      setPending(false);
    }
  }

  const disabled = locked || pending;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2" role="group" aria-label="Content feedback">
      <button
        type="button"
        disabled={disabled}
        onClick={() => vote("UP")}
        aria-label="Thumbs up — this content was helpful"
        aria-pressed={selected === "UP"}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed ${
          selected === "UP"
            ? "border-emerald-400/60 bg-emerald-500/20 text-emerald-300"
            : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-emerald-500/40 hover:text-emerald-300 disabled:opacity-50"
        }`}
      >
        <ThumbsUp className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => vote("DOWN")}
        aria-label="Thumbs down — this content was not helpful"
        aria-pressed={selected === "DOWN"}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-md border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60 disabled:cursor-not-allowed ${
          selected === "DOWN"
            ? "border-rose-400/60 bg-rose-500/20 text-rose-300"
            : "border-slate-700 bg-slate-900/60 text-slate-300 hover:border-rose-500/40 hover:text-rose-300 disabled:opacity-50"
        }`}
      >
        <ThumbsDown className="h-4 w-4" aria-hidden />
      </button>
      <span className="sr-only" aria-live="polite">
        {status}
      </span>
      {selected && !error && (
        <span className="text-xs text-slate-400" aria-hidden>
          Thanks for the signal
        </span>
      )}
      {error && (
        <span className="text-xs text-rose-400" role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
