import { NextResponse } from "next/server";
import { createToken, hashPassword, setAuthCookie } from "@/lib/auth";
import { jsonCreated, jsonError } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return jsonError(
        parsed.error.issues.map((i) => i.message).join(", "),
        400,
      );
    }

    const { name, email, password } = parsed.data;
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return jsonError("An account with this email already exists", 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

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
    console.error("register error", error);
    return jsonError("Unable to register right now", 500);
  }
}
