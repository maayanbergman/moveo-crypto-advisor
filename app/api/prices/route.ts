import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import { parseAssets } from "@/lib/preferences";
import { fetchCoinPrices } from "@/services/coingecko";
import type { CryptoAsset } from "@/types";

/**
 * Optional API for clients. Dashboard widgets call services directly
 * with preference props to avoid N+1 preference lookups.
 * Accepts `?assets=BTC,ETH` so callers need not re-query UserPreference.
 */
export async function GET(request: Request) {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const rawAssets = searchParams.get("assets");
    const assets: CryptoAsset[] =
      rawAssets && rawAssets.length > 0
        ? parseAssets(rawAssets.split(",").map((s) => s.trim().toUpperCase()))
        : (["BTC", "ETH", "SOL", "ADA"] as CryptoAsset[]);

    const result = await fetchCoinPrices(
      assets.length > 0 ? assets : (["BTC", "ETH"] as CryptoAsset[]),
    );
    return jsonOk(result);
  } catch (error) {
    console.error("prices error", error);
    return jsonError("Unable to load prices", 500);
  }
}
