import type { ContentType, CryptoAsset, InvestorType } from "@/types";

export const AUTH_COOKIE_NAME = "crypto_advisor_token";
export const JWT_EXPIRES_IN = "7d";
export const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
export const BCRYPT_SALT_ROUNDS = 12;
export const JWT_SECRET_MIN_LENGTH = 16;

/** External market/news/meme API hard timeout */
export const EXTERNAL_API_TIMEOUT_MS = 5_000;
/** LLM provider hard timeout */
export const AI_API_TIMEOUT_MS = 8_000;
/** Next.js fetch cache revalidation for market data */
export const MARKET_DATA_REVALIDATE_SECONDS = 60;
/** Reddit meme listing cache */
export const MEME_REVALIDATE_SECONDS = 3_600;

export const DEFAULT_WATCHLIST: CryptoAsset[] = ["BTC", "ETH", "SOL", "ADA"];
export const DEFAULT_NEWS_ASSETS: CryptoAsset[] = ["BTC", "ETH"];
export const DEFAULT_CONTENT_TYPES: ContentType[] = [
  "Market News",
  "Charts/Prices",
];
export const DEFAULT_INVESTOR_TYPE: InvestorType = "HODLer";

export const API_ERROR_MESSAGES = {
  unauthorized: "Unauthorized",
  invalidCredentials: "Invalid email or password",
  emailTaken: "An account with this email already exists",
  registerFailed: "Unable to register right now",
  loginFailed: "Unable to login right now",
  sessionLoadFailed: "Unable to load session",
  userNotFound: "User not found",
  preferencesLoadFailed: "Unable to load preferences",
  preferencesSaveFailed: "Unable to save preferences",
  onboardingRequired: "Complete onboarding first",
  pricesFailed: "Unable to load prices",
  newsFailed: "Unable to load news",
  insightFailed: "Unable to generate insight",
  memeFailed: "Unable to load meme",
  feedbackFailed: "Unable to save feedback",
  feedbackDuplicate: "You already voted on this item today",
  genericServer: "Something went wrong. Please try again.",
} as const;

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

/** Security headers applied globally via next.config */
export const SECURITY_HEADERS: { key: string; value: string }[] = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "img-src 'self' data: blob: https://images.unsplash.com https://i.imgur.com https://i.redd.it https://preview.redd.it https://*.redditmedia.com",
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "connect-src 'self' https://api.coingecko.com https://cryptopanic.com https://openrouter.ai https://api-inference.huggingface.co https://www.reddit.com",
      "upgrade-insecure-requests",
    ].join("; "),
  },
];
