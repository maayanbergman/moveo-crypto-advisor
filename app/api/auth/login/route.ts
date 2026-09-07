import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { findUserByEmail } from "@/lib/services/users";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const { email, password } = parsed.data;
    const user = await findUserByEmail(email);

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError(API_ERROR_MESSAGES.invalidCredentials, 401);
    }

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = jsonOk({
      user: { id: user.id, email: user.email, name: user.name },
      hasPreferences: Boolean(user.preference),
    });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    logger.error("api.auth.login", error);
    return jsonError(API_ERROR_MESSAGES.loginFailed, 500);
  }
}
