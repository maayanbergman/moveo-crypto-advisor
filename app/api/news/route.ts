import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import {
  API_ERROR_MESSAGES,
  DEFAULT_NEWS_ASSETS,
} from "@/lib/constants";
import { logger } from "@/lib/logger";
import { parseAssets } from "@/lib/preferences";
import { fetchCryptoNews } from "@/services/news";
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
        : DEFAULT_NEWS_ASSETS;

    const result = await fetchCryptoNews(
      assets.length > 0 ? assets : DEFAULT_NEWS_ASSETS,
    );
    return jsonOk(result);
  } catch (error) {
    logger.error("api.news.get", error, { userId: auth.user.id });
    return jsonError(API_ERROR_MESSAGES.newsFailed, 500);
  }
}
