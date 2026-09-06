import { ASSET_BY_SYMBOL, CRYPTO_ASSETS } from "@/lib/constants";
import {
  EXTERNAL_API_TIMEOUT_MS,
  fetchWithTimeout,
} from "@/lib/fetch";
import type { CoinPrice, CryptoAsset } from "@/types";

type CoinGeckoSimplePrice = Record<
  string,
  {
    usd?: number;
    usd_24h_change?: number;
  }
>;

const FALLBACK_PRICES: Record<string, { usd: number; usd_24h_change: number }> =
  {
    bitcoin: { usd: 97500, usd_24h_change: 1.8 },
    ethereum: { usd: 3650, usd_24h_change: -0.6 },
    solana: { usd: 178, usd_24h_change: 3.2 },
    cardano: { usd: 0.72, usd_24h_change: 0.4 },
    polkadot: { usd: 6.8, usd_24h_change: -1.1 },
    "avalanche-2": { usd: 38.5, usd_24h_change: 2.1 },
    chainlink: { usd: 18.2, usd_24h_change: 0.9 },
    "matic-network": { usd: 0.48, usd_24h_change: -0.3 },
  };

function mapPrices(
  symbols: CryptoAsset[],
  data: CoinGeckoSimplePrice,
): CoinPrice[] {
  return symbols.map((symbol) => {
    const meta = ASSET_BY_SYMBOL[symbol];
    const entry = data[meta.coingeckoId] ?? FALLBACK_PRICES[meta.coingeckoId];
    return {
      id: meta.coingeckoId,
      symbol: meta.symbol,
      name: meta.name,
      price: entry?.usd ?? 0,
      change24h: entry?.usd_24h_change ?? 0,
    };
  });
}

export async function fetchCoinPrices(
  assets: CryptoAsset[],
): Promise<{ prices: CoinPrice[]; source: "live" | "fallback"; isFallback: boolean }> {
  const symbols =
    assets.length > 0
      ? assets
      : (CRYPTO_ASSETS.slice(0, 4).map((a) => a.symbol) as CryptoAsset[]);

  const ids = symbols.map((s) => ASSET_BY_SYMBOL[s].coingeckoId).join(",");
  const url = `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd&include_24hr_change=true`;

  try {
    const response = await fetchWithTimeout(url, {
      timeoutMs: EXTERNAL_API_TIMEOUT_MS,
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`CoinGecko responded with ${response.status}`);
    }

    const data = (await response.json()) as CoinGeckoSimplePrice;
    return {
      prices: mapPrices(symbols, data),
      source: "live",
      isFallback: false,
    };
  } catch {
    return {
      prices: mapPrices(symbols, FALLBACK_PRICES),
      source: "fallback",
      isFallback: true,
    };
  }
}
