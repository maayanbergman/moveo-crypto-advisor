import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/constants";
import { logger } from "@/lib/logger";
import {
  getTypedPreferenceByUserId,
  upsertPreference,
} from "@/lib/services/preferences";
import { preferencesSchema } from "@/lib/validations";

export async function GET() {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const preference = await getTypedPreferenceByUserId(auth.user.id);
    return jsonOk({ preference });
  } catch (error) {
    logger.error("api.preferences.get", error, { userId: auth.user.id });
    return jsonError(API_ERROR_MESSAGES.preferencesLoadFailed, 500);
  }
}

export async function POST(request: Request) {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const body: unknown = await request.json();
    const parsed = preferencesSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const preference = await upsertPreference({
      userId: auth.user.id,
      assets: parsed.data.assets as typeof parsed.data.assets,
      investorType: parsed.data.investorType as typeof parsed.data.investorType,
      contentTypes: parsed.data.contentTypes as typeof parsed.data.contentTypes,
    });

    return jsonOk({ preference });
  } catch (error) {
    logger.error("api.preferences.post", error, { userId: auth.user.id });
    return jsonError(API_ERROR_MESSAGES.preferencesSaveFailed, 500);
  }
}
