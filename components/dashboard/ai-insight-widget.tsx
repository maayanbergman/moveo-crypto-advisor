import { Sparkles } from "lucide-react";
import { SectionCard } from "@/components/ui/section-card";
import { WidgetError } from "@/components/ui/widget-error";
import { VoteButtons } from "@/components/ui/vote-buttons";
import { generateAiInsight } from "@/services/ai";
import { fetchCoinPrices } from "@/services/coingecko";
import type { ContentType, CryptoAsset, InvestorType } from "@/types";

interface AiInsightWidgetProps {
  name: string;
  assets: CryptoAsset[];
  investorType: InvestorType;
  contentTypes: ContentType[];
}

export async function AiInsightWidget({
  name,
  assets,
  investorType,
  contentTypes,
}: AiInsightWidgetProps) {
  try {
    // Shares Next.js fetch cache with PriceWidget (same CoinGecko URL + revalidate: 60)
    const { prices } = await fetchCoinPrices(assets);
    const priceSnapshot = prices
      .map(
        (p) =>
          `${p.symbol} $${p.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${p.change24h >= 0 ? "+" : ""}${p.change24h.toFixed(2)}%)`,
      )
      .join("; ");

    const insight = await generateAiInsight({
      name,
      assets,
      investorType,
      contentTypes,
      priceSnapshot,
    });

    return (
      <SectionCard
        title="AI Insight of the Day"
        subtitle="Actionable analysis tailored to your investor profile"
        badge={insight.mocked ? "Mock LLM" : "LLM"}
      >
        <div className="rounded-lg border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 p-4">
          <div className="flex items-center gap-2 text-cyan-300">
            <Sparkles className="h-4 w-4" />
            <p className="text-sm font-medium">{insight.title}</p>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {insight.summary}
          </p>
          <ul className="mt-4 space-y-2">
            {insight.actionItems.map((item) => (
              <li
                key={item}
                className="rounded-md border border-slate-800/80 bg-slate-950/60 px-3 py-2 text-sm text-slate-200"
              >
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-[11px] uppercase tracking-wide text-slate-500">
            Model: {insight.model}
          </p>
          <VoteButtons section="AI_INSIGHT" itemId={insight.id} />
        </div>
      </SectionCard>
    );
  } catch {
    return (
      <SectionCard
        title="AI Insight of the Day"
        subtitle="Actionable analysis tailored to your investor profile"
        badge="Error"
      >
        <WidgetError message="Unable to generate today's insight. Please refresh in a moment." />
      </SectionCard>
    );
  }
}
