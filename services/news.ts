import type { NewsItem } from "@/types";

const FALLBACK_NEWS: NewsItem[] = [
  {
    id: "fallback-btc-etf",
    title: "Bitcoin ETFs see renewed inflows as institutions re-enter",
    url: "https://www.coindesk.com/",
    source: "Market Desk (fallback)",
    publishedAt: new Date().toISOString(),
    currencies: ["BTC"],
  },
  {
    id: "fallback-eth-upgrade",
    title: "Ethereum staking yields stabilize after network upgrades",
    url: "https://ethereum.org/",
    source: "Protocol Notes (fallback)",
    publishedAt: new Date(Date.now() - 3600_000).toISOString(),
    currencies: ["ETH"],
  },
  {
    id: "fallback-sol-defi",
    title: "Solana DeFi volumes climb on meme-coin and perpetuals activity",
    url: "https://solana.com/",
    source: "Chain Pulse (fallback)",
    publishedAt: new Date(Date.now() - 7200_000).toISOString(),
    currencies: ["SOL"],
  },
  {
    id: "fallback-ada-governance",
    title: "Cardano community debates next treasury allocation cycle",
    url: "https://cardano.org/",
    source: "Governance Watch (fallback)",
    publishedAt: new Date(Date.now() - 10_800_000).toISOString(),
    currencies: ["ADA"],
  },
  {
    id: "fallback-macro",
    title: "Risk appetite returns to crypto as dollar softens",
    url: "https://www.bloomberg.com/",
    source: "Macro Brief (fallback)",
    publishedAt: new Date(Date.now() - 14_400_000).toISOString(),
    currencies: ["BTC", "ETH"],
  },
  {
    id: "fallback-link",
    title: "Chainlink CCIP integrations expand cross-chain settlement use cases",
    url: "https://chain.link/",
    source: "Oracle Feed (fallback)",
    publishedAt: new Date(Date.now() - 18_000_000).toISOString(),
    currencies: ["LINK"],
  },
];

interface CryptoPanicPost {
  id: number;
  title: string;
  url: string;
  published_at: string;
  currencies?: { code: string }[];
  source?: { title?: string };
}

interface CryptoPanicResponse {
  results?: CryptoPanicPost[];
}

function prioritizeByAssets(
  items: NewsItem[],
  assets: string[],
): NewsItem[] {
  if (assets.length === 0) return items;
  const preferred = new Set(assets.map((a) => a.toUpperCase()));
  return [...items].sort((a, b) => {
    const aScore = a.currencies.some((c) => preferred.has(c.toUpperCase()))
      ? 1
      : 0;
    const bScore = b.currencies.some((c) => preferred.has(c.toUpperCase()))
      ? 1
      : 0;
    return bScore - aScore;
  });
}

export async function fetchCryptoNews(
  assets: string[],
): Promise<{ news: NewsItem[]; source: "live" | "fallback" }> {
  const apiKey = process.env.CRYPTOPANIC_API_KEY;
  const currencies = assets.join(",").toLowerCase();

  if (!apiKey) {
    return {
      news: prioritizeByAssets(FALLBACK_NEWS, assets).slice(0, 8),
      source: "fallback",
    };
  }

  const url = new URL("https://cryptopanic.com/api/v1/posts/");
  url.searchParams.set("auth_token", apiKey);
  url.searchParams.set("public", "true");
  url.searchParams.set("kind", "news");
  if (currencies) {
    url.searchParams.set("currencies", currencies);
  }

  try {
    const response = await fetch(url.toString(), {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`CryptoPanic responded with ${response.status}`);
    }

    const data = (await response.json()) as CryptoPanicResponse;
    const news: NewsItem[] = (data.results ?? []).slice(0, 12).map((post) => ({
      id: String(post.id),
      title: post.title,
      url: post.url,
      source: post.source?.title ?? "CryptoPanic",
      publishedAt: post.published_at,
      currencies: (post.currencies ?? []).map((c) => c.code.toUpperCase()),
    }));

    if (news.length === 0) {
      throw new Error("Empty CryptoPanic payload");
    }

    return {
      news: prioritizeByAssets(news, assets),
      source: "live",
    };
  } catch {
    return {
      news: prioritizeByAssets(FALLBACK_NEWS, assets).slice(0, 8),
      source: "fallback",
    };
  }
}
