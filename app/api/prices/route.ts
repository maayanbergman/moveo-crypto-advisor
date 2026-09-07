import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import {
  API_ERROR_MESSAGES,
  DEFAULT_WATCHLIST,
} from "@/lib/constants";
import { logger } from "@/lib/logger";
import { parseAssets } from "@/lib/preferences";
import { fetchCoinPrices } from "@/services/coingecko";
import type { CryptoAsset } from "@/types";

export async function GET(request: Request) {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const { searchParams } = new URL(request.url);
    const rawAssets = searchParams.get("assets");
    const assets: CryptoAsset[] =
      rawAssets && rawAssets.length > 0
        ? parseAssets(rawAssets.split(",").map((s) => s.trim().toUpperCase()))
        : DEFAULT_WATCHLIST;

    const result = await fetchCoinPrices(
      assets.length > 0 ? assets : DEFAULT_WATCHLIST,
    );
    return jsonOk(result);
  } catch (error) {
    logger.error("api.prices.get", error, { userId: auth.user.id });
    return jsonError(API_ERROR_MESSAGES.pricesFailed, 500);
  }
}
