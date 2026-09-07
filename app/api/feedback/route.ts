import { jsonCreated, jsonError, requireAuthUser } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/constants";
import { logger } from "@/lib/logger";
import {
  createFeedback,
  findFeedbackToday,
} from "@/lib/services/feedback";
import { feedbackSchema } from "@/lib/validations";

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
    const existing = await findFeedbackToday({
      userId: auth.user.id,
      section: parsed.data.section,
      itemId,
    });

    if (existing) {
      return jsonError(API_ERROR_MESSAGES.feedbackDuplicate, 409);
    }

    const feedback = await createFeedback({
      userId: auth.user.id,
      section: parsed.data.section,
      rating: parsed.data.rating,
      itemId: parsed.data.itemId,
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
    logger.error("api.feedback.post", error, { userId: auth.user.id });
    return jsonError(API_ERROR_MESSAGES.feedbackFailed, 500);
  }
}
