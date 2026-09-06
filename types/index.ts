export type InvestorType = "HODLer" | "Day Trader" | "NFT Collector" | "Degen";

export type ContentType = "Market News" | "Charts/Prices" | "Social" | "Fun";

export type CryptoAsset = "BTC" | "ETH" | "SOL" | "ADA" | "DOT" | "AVAX" | "LINK" | "MATIC";

export type FeedbackSection = "NEWS" | "PRICE" | "AI_INSIGHT" | "MEME";

export type FeedbackRating = "UP" | "DOWN";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
}

export interface UserPreferenceData {
  assets: CryptoAsset[];
  investorType: InvestorType;
  contentTypes: ContentType[];
  updatedAt?: string;
}

export interface CoinPrice {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  image?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  url: string;
  source: string;
  publishedAt: string;
  currencies: string[];
}

export interface AiInsight {
  id: string;
  title: string;
  summary: string;
  actionItems: string[];
  generatedAt: string;
  model: string;
  mocked: boolean;
  isFallback: boolean;
}

export interface MemeItem {
  id: string;
  title: string;
  imageUrl: string;
  source: string;
  permalink?: string;
}

export interface FeedbackPayload {
  section: FeedbackSection;
  rating: FeedbackRating;
  itemId?: string;
}

export interface ApiError {
  error: string;
}

export interface PricesApiResponse {
  prices: CoinPrice[];
  source: "live" | "fallback";
}

export interface NewsApiResponse {
  news: NewsItem[];
  source: "live" | "fallback";
}

export interface AiInsightApiResponse {
  insight: AiInsight;
}

export interface MemeApiResponse {
  meme: MemeItem;
  source: "reddit" | "fallback";
}

export interface MeApiResponse {
  user: AuthUser;
  preference: UserPreferenceData | null;
}
