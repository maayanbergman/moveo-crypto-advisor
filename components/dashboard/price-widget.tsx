import { TrendingDown, TrendingUp } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { EmptyState, WidgetError } from "@/components/ui/widget-error";
import { VoteButtons } from "@/components/ui/vote-buttons";
import { fetchCoinPrices } from "@/services/coingecko";
import type { CryptoAsset } from "@/types";

interface PriceWidgetProps {
  assets: CryptoAsset[];
}

export async function PriceWidget({ assets }: PriceWidgetProps) {
  try {
    const { prices, isFallback } = await fetchCoinPrices(assets);

    return (
      <SectionCard
        title="Coin Prices"
        subtitle="Live quotes for your selected assets"
        badge={isFallback ? "Offline Mode" : "Live"}
        isFallback={isFallback}
        badgeTitle={
          isFallback
            ? "Simulated prices — CoinGecko unavailable or timed out"
            : "Live CoinGecko quotes"
        }
      >
        {prices.length === 0 ? (
          <EmptyState
            title="No prices for your watchlist"
            description="We couldn't find live quotes for your selected assets right now. Try again in a minute, or update your preferences."
            icon={<TrendingUp className="h-5 w-5" aria-hidden />}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {prices.map((coin) => {
              const up = coin.change24h >= 0;
              return (
                <div
                  key={coin.id}
                  className="rounded-lg border border-slate-800 bg-slate-900/70 p-4"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">
                        {coin.symbol}
                      </p>
                      <p className="text-xs text-slate-500">{coin.name}</p>
                    </div>
                    {up ? (
                      <TrendingUp
                        className="h-4 w-4 text-emerald-400"
                        aria-hidden
                      />
                    ) : (
                      <TrendingDown
                        className="h-4 w-4 text-rose-400"
                        aria-hidden
                      />
                    )}
                  </div>
                  <p className="mt-3 text-xl font-semibold tracking-tight text-slate-50">
                    $
                    {coin.price.toLocaleString(undefined, {
                      maximumFractionDigits: coin.price < 10 ? 4 : 2,
                    })}
                  </p>
                  <p
                    className={`mt-1 text-sm ${up ? "text-emerald-400" : "text-rose-400"}`}
                  >
                    <span className="sr-only">
                      {coin.symbol} 24 hour change{" "}
                    </span>
                    {up ? "+" : ""}
                    {coin.change24h.toFixed(2)}% 24h
                  </p>
                  <VoteButtons section="PRICE" itemId={coin.id} />
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>
    );
  } catch {
    return (
      <SectionCard
        title="Coin Prices"
        subtitle="Live quotes for your selected assets"
        badge="Error"
      >
        <WidgetError message="Unable to load coin prices right now. Please try again shortly." />
      </SectionCard>
    );
  }
}
