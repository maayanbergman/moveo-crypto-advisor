import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import { toUserPreferenceData } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";
import { preferencesSchema } from "@/lib/validations";

export async function GET() {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const preference = await prisma.userPreference.findUnique({
      where: { userId: auth.user.id },
    });

    if (!preference) {
      return jsonOk({ preference: null });
    }

    return jsonOk({ preference: toUserPreferenceData(preference) });
  } catch (error) {
    console.error("preferences GET error", error);
    return jsonError("Unable to load preferences", 500);
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

    const preference = await prisma.userPreference.upsert({
      where: { userId: auth.user.id },
      create: {
        userId: auth.user.id,
        assets: parsed.data.assets,
        investorType: parsed.data.investorType,
        contentTypes: parsed.data.contentTypes,
      },
      update: {
        assets: parsed.data.assets,
        investorType: parsed.data.investorType,
        contentTypes: parsed.data.contentTypes,
      },
    });

    return jsonOk({ preference: toUserPreferenceData(preference) });
  } catch (error) {
    console.error("preferences POST error", error);
    return jsonError("Unable to save preferences", 500);
  }
}
