import { jsonCreated, jsonError, requireAuthUser } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { feedbackSchema } from "@/lib/validations";

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const body = await request.json();
    const parsed = feedbackSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
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
