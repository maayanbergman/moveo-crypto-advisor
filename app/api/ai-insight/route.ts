import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import { toUserPreferenceData } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { generateAiInsight } from "@/services/ai";
import { fetchCoinPrices } from "@/services/coingecko";

export async function GET() {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const preferenceRow = await prisma.userPreference.findUnique({
      where: { userId: auth.user.id },
    });

    if (!preferenceRow) {
      return jsonError("Complete onboarding first", 400);
    }

    const preference = toUserPreferenceData(preferenceRow);
    const { prices } = await fetchCoinPrices(preference.assets);
    const priceSnapshot = prices
      .map(
        (p) =>
          `${p.symbol} $${p.price.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${p.change24h >= 0 ? "+" : ""}${p.change24h.toFixed(2)}%)`,
      )
      .join("; ");

    const insight = await generateAiInsight({
      name: auth.user.name,
      assets: preference.assets,
      investorType: preference.investorType,
      contentTypes: preference.contentTypes,
      priceSnapshot,
    });

    return jsonOk({ insight });
  } catch (error) {
    console.error("ai-insight error", error);
    return jsonError("Unable to generate insight", 500);
  }
}
