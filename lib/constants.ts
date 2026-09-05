import type { ContentType, CryptoAsset, InvestorType } from "@/types";

export const AUTH_COOKIE_NAME = "crypto_advisor_token";
export const JWT_EXPIRES_IN = "7d";

export const CRYPTO_ASSETS: {
  symbol: CryptoAsset;
  name: string;
  coingeckoId: string;
}[] = [
  { symbol: "BTC", name: "Bitcoin", coingeckoId: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana" },
  { symbol: "ADA", name: "Cardano", coingeckoId: "cardano" },
  { symbol: "DOT", name: "Polkadot", coingeckoId: "polkadot" },
  { symbol: "AVAX", name: "Avalanche", coingeckoId: "avalanche-2" },
  { symbol: "LINK", name: "Chainlink", coingeckoId: "chainlink" },
  { symbol: "MATIC", name: "Polygon", coingeckoId: "matic-network" },
];

export const INVESTOR_TYPES: InvestorType[] = [
  "HODLer",
  "Day Trader",
  "NFT Collector",
  "Degen",
];

export const CONTENT_TYPES: ContentType[] = [
  "Market News",
  "Charts/Prices",
  "Social",
  "Fun",
];

export const ASSET_BY_SYMBOL = Object.fromEntries(
  CRYPTO_ASSETS.map((asset) => [asset.symbol, asset]),
) as Record<CryptoAsset, (typeof CRYPTO_ASSETS)[number]>;
