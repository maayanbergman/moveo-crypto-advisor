import "server-only";

import type { FeedbackRating, FeedbackSection } from "@/types";
import { prisma } from "@/lib/prisma";

export type CreateFeedbackInput = {
  userId: string;
  section: FeedbackSection;
  rating: FeedbackRating;
  itemId?: string;
};

function startOfUtcDay(date = new Date()): Date {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function startOfNextUtcDay(date = new Date()): Date {
  const start = startOfUtcDay(date);
  start.setUTCDate(start.getUTCDate() + 1);
  return start;
}

export async function findFeedbackToday(input: {
  userId: string;
  section: FeedbackSection;
  itemId: string | null;
}) {
  return prisma.feedback.findFirst({
    where: {
      userId: input.userId,
      section: input.section,
      itemId: input.itemId,
      timestamp: {
        gte: startOfUtcDay(),
        lt: startOfNextUtcDay(),
      },
    },
    select: { id: true },
  });
}

export async function createFeedback(input: CreateFeedbackInput) {
  return prisma.feedback.create({
    data: {
      userId: input.userId,
      section: input.section,
      rating: input.rating,
      itemId: input.itemId,
    },
  });
}
