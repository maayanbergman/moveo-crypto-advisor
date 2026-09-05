import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import { toUserPreferenceData } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      include: { preference: true },
    });

    if (!user) {
      return jsonError("User not found", 404);
    }

    return jsonOk({
      user: { id: user.id, email: user.email, name: user.name },
      preference: user.preference
        ? toUserPreferenceData(user.preference)
        : null,
    });
  } catch (error) {
    console.error("me error", error);
    return jsonError("Unable to load session", 500);
  }
}
