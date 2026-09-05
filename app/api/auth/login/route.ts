import { createToken, setAuthCookie, verifyPassword } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({
      where: { email },
      include: { preference: true },
    });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return jsonError("Invalid email or password", 401);
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
    console.error("login error", error);
    return jsonError("Unable to login right now", 500);
  }
}
