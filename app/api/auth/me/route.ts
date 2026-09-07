import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { toUserPreferenceData } from "@/lib/preferences";
import { findUserById } from "@/lib/services/users";

export async function GET() {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const user = await findUserById(auth.user.id);

    if (!user) {
      return jsonError(API_ERROR_MESSAGES.userNotFound, 404);
    }

    return jsonOk({
      user: { id: user.id, email: user.email, name: user.name },
      preference: user.preference
        ? toUserPreferenceData(user.preference)
        : null,
    });
  } catch (error) {
    logger.error("api.auth.me", error, { userId: auth.user.id });
    return jsonError(API_ERROR_MESSAGES.sessionLoadFailed, 500);
  }
}
