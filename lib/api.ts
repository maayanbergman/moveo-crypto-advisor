import { NextResponse } from "next/server";
import { getSessionFromCookies, toAuthUser } from "@/lib/auth";
import { API_ERROR_MESSAGES } from "@/lib/constants";
import type { AuthUser } from "@/types";

export function jsonOk<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, { status: 200, ...init });
}

export function jsonCreated<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAuthUser(): Promise<
  { user: AuthUser } | { response: NextResponse }
> {
  const session = await getSessionFromCookies();
  if (!session) {
    return { response: jsonError(API_ERROR_MESSAGES.unauthorized, 401) };
  }
  return { user: toAuthUser(session) };
}
