import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import { parseAssets } from "@/lib/preferences";
import { fetchCryptoNews } from "@/services/news";
import type { CryptoAsset } from "@/types";

/**
 * Optional API for clients. Dashboard widgets call services directly
 * with preference props to avoid N+1 preference lookups.
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
        : (["BTC", "ETH"] as CryptoAsset[]);

    const result = await fetchCryptoNews(
      assets.length > 0 ? assets : ["BTC", "ETH"],
    );
    return jsonOk(result);
  } catch (error) {
    console.error("news error", error);
    return jsonError("Unable to load news", 500);
  }
}
