import type {
  ContentType,
  CryptoAsset,
  InvestorType,
  UserPreferenceData,
} from "@/types";
import {
  CONTENT_TYPES,
  CRYPTO_ASSETS,
  DEFAULT_CONTENT_TYPES,
  DEFAULT_INVESTOR_TYPE,
  DEFAULT_NEWS_ASSETS,
  INVESTOR_TYPES,
} from "@/lib/constants";

const ASSET_SET = new Set<string>(CRYPTO_ASSETS.map((a) => a.symbol));
const INVESTOR_SET = new Set<string>(INVESTOR_TYPES);
const CONTENT_SET = new Set<string>(CONTENT_TYPES);

export function isCryptoAsset(value: string): value is CryptoAsset {
  return ASSET_SET.has(value);
}

export function isInvestorType(value: string): value is InvestorType {
  return INVESTOR_SET.has(value);
}

export function isContentType(value: string): value is ContentType {
  return CONTENT_SET.has(value);
}

export function parseAssets(raw: string[]): CryptoAsset[] {
  return raw.filter(isCryptoAsset);
}

export function toUserPreferenceData(input: {
  assets: string[];
  investorType: string;
  contentTypes: string[];
  updatedAt?: Date;
}): UserPreferenceData {
  const assets = parseAssets(input.assets);
  const investorType = isInvestorType(input.investorType)
    ? input.investorType
    : DEFAULT_INVESTOR_TYPE;
  const contentTypes = input.contentTypes.filter(isContentType);

  return {
    assets: assets.length > 0 ? assets : DEFAULT_NEWS_ASSETS,
    investorType,
    contentTypes:
      contentTypes.length > 0 ? contentTypes : DEFAULT_CONTENT_TYPES,
    updatedAt: input.updatedAt?.toISOString(),
  };
}
