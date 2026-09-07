import "server-only";

import type { ContentType, CryptoAsset, InvestorType } from "@/types";
import { prisma } from "@/lib/prisma";
import { toUserPreferenceData } from "@/lib/preferences";

export async function findPreferenceByUserId(userId: string) {
  return prisma.userPreference.findUnique({
    where: { userId },
  });
}

export async function userHasPreferences(userId: string): Promise<boolean> {
  const preference = await prisma.userPreference.findUnique({
    where: { userId },
    select: { id: true },
  });
  return Boolean(preference);
}

export async function getTypedPreferenceByUserId(userId: string) {
  const row = await findPreferenceByUserId(userId);
  return row ? toUserPreferenceData(row) : null;
}

export async function upsertPreference(input: {
  userId: string;
  assets: CryptoAsset[];
  investorType: InvestorType;
  contentTypes: ContentType[];
}) {
  const row = await prisma.userPreference.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      assets: input.assets,
      investorType: input.investorType,
      contentTypes: input.contentTypes,
    },
    update: {
      assets: input.assets,
      investorType: input.investorType,
      contentTypes: input.contentTypes,
    },
  });

  return toUserPreferenceData(row);
}
