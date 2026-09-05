import { SectionCard } from "@/components/ui/section-card";
import { WidgetError } from "@/components/ui/widget-error";
import { VoteButtons } from "@/components/ui/vote-buttons";
import { fetchCryptoMeme } from "@/services/memes";

export async function MemeWidget() {
  try {
    const { meme, source } = await fetchCryptoMeme();
    const altText = `Crypto meme: ${meme.title}`;

    return (
      <SectionCard
        title="Fun Crypto Meme"
        subtitle="A daily dose of market culture"
        badge={source === "reddit" ? "Reddit" : "Fallback"}
      >
        <div>
          <p className="mb-3 text-sm font-medium text-slate-200">{meme.title}</p>
          <div className="relative overflow-hidden rounded-lg border border-slate-800 bg-slate-900">
            {/* eslint-disable-next-line @next/next/no-img-element -- remote meme hosts vary */}
            <img
              src={meme.imageUrl}
              alt={altText}
              className="max-h-80 w-full object-contain bg-slate-950"
            />
          </div>
          {meme.permalink && (
            <a
              href={meme.permalink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`View original meme source for “${meme.title}” (opens in a new tab)`}
              className="mt-2 inline-block text-xs text-cyan-300 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
            >
              View source
            </a>
          )}
          <VoteButtons section="MEME" itemId={meme.id} />
        </div>
      </SectionCard>
    );
  } catch {
    return (
      <SectionCard
        title="Fun Crypto Meme"
        subtitle="A daily dose of market culture"
        badge="Error"
      >
        <WidgetError message="Unable to load today's meme. Please try again shortly." />
      </SectionCard>
    );
  }
}
