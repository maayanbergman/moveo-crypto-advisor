import { jsonCreated, jsonError, requireAuthUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/lib/validations";

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

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const body: unknown = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const itemId = parsed.data.itemId ?? null;
    const dayStart = startOfUtcDay();
    const dayEnd = startOfNextUtcDay();

    const existing = await prisma.feedback.findFirst({
      where: {
        userId: auth.user.id,
        section: parsed.data.section,
        itemId,
        timestamp: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
      select: { id: true },
    });

    if (existing) {
      return jsonError("You already voted on this item today", 409);
    }

    const feedback = await prisma.feedback.create({
      data: {
        userId: auth.user.id,
        section: parsed.data.section,
        rating: parsed.data.rating,
        itemId: parsed.data.itemId,
      },
    });

    return jsonCreated({
      feedback: {
        id: feedback.id,
        section: feedback.section,
        rating: feedback.rating,
        itemId: feedback.itemId,
        timestamp: feedback.timestamp.toISOString(),
      },
    });
  } catch (error) {
    console.error("feedback error", error);
    return jsonError("Unable to save feedback", 500);
  }
}
