import { ExternalLink, Newspaper } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState, WidgetError } from "@/components/ui/widget-error";
import { VoteButtons } from "@/components/ui/vote-buttons";
import { fetchCryptoNews } from "@/services/news";
import type { CryptoAsset } from "@/types";

interface NewsWidgetProps {
  assets: CryptoAsset[];
}

export async function NewsWidget({ assets }: NewsWidgetProps) {
  try {
    const { news, isFallback } = await fetchCryptoNews(assets);
    const assetLabel = assets.join(", ");

    return (
      <SectionCard
        title="Market News"
        subtitle="Curated headlines prioritized by your assets"
        badge={isFallback ? "Offline Mode" : "Live"}
        isFallback={isFallback}
        badgeTitle={
          isFallback
            ? "Simulated headlines — live news feed unavailable or timed out"
            : "Live CryptoPanic headlines"
        }
      >
        {news.length === 0 ? (
          <EmptyState
            title="No news found for your assets right now"
            description={`We couldn't find recent headlines for ${assetLabel || "your watchlist"}. Check back soon, or broaden your asset preferences.`}
            icon={<Newspaper className="h-5 w-5" aria-hidden />}
          />
        ) : (
          <ul className="space-y-3">
            {news.slice(0, 6).map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`${item.title} (opens in a new tab)`}
                  className="group flex items-start justify-between gap-3 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400/60"
                >
                  <div>
                    <p className="font-medium text-slate-100 group-hover:text-cyan-300">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      {item.source} ·{" "}
                      {new Date(item.publishedAt).toLocaleString()}
                      {item.currencies.length > 0
                        ? ` · ${item.currencies.join(", ")}`
                        : ""}
                    </p>
                  </div>
                  <ExternalLink
                    className="mt-1 h-4 w-4 shrink-0 text-slate-500"
                    aria-hidden
                  />
                </a>
                <VoteButtons section="NEWS" itemId={item.id} />
              </li>
            ))}
          </ul>
        )}
      </SectionCard>
    );
  } catch {
    return (
      <SectionCard
        title="Market News"
        subtitle="Curated headlines prioritized by your assets"
        badge="Error"
      >
        <WidgetError message="Unable to load market news right now. Please try again shortly." />
      </SectionCard>
    );
  }
}
