import { createToken, hashPassword, setAuthCookie } from "@/lib/auth";
import { jsonCreated, jsonError } from "@/lib/api";
import { API_ERROR_MESSAGES } from "@/lib/constants";
import { logger } from "@/lib/logger";
import { createUser, findUserByEmail } from "@/lib/services/users";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const { name, email, password } = parsed.data;
    const existing = await findUserByEmail(email);
    if (existing) {
      return jsonError(API_ERROR_MESSAGES.emailTaken, 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await createUser({ name, email, passwordHash });

    const token = await createToken({
      userId: user.id,
      email: user.email,
      name: user.name,
    });

    const response = jsonCreated({
      user: { id: user.id, email: user.email, name: user.name },
      hasPreferences: false,
    });
    setAuthCookie(response, token);
    return response;
  } catch (error) {
    logger.error("api.auth.register", error);
    return jsonError(API_ERROR_MESSAGES.registerFailed, 500);
  }
}
