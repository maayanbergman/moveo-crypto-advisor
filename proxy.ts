import { NextResponse, type NextRequest } from "next/server";
import { AUTH_COOKIE_NAME, SECURITY_HEADERS } from "@/lib/constants";
import { verifyToken } from "@/lib/auth";

const protectedPrefixes = ["/dashboard", "/onboarding"];
const authPages = ["/login", "/register"];

function applySecurityHeaders(response: NextResponse): NextResponse {
  for (const header of SECURITY_HEADERS) {
    response.headers.set(header.key, header.value);
  }
  return response;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const session = token ? await verifyToken(token) : null;

  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
  const isAuthPage = authPages.some(
    (page) => pathname === page || pathname.startsWith(`${page}/`),
  );

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return applySecurityHeaders(NextResponse.redirect(loginUrl));
  }

  if (isAuthPage && session) {
    return applySecurityHeaders(
      NextResponse.redirect(new URL("/dashboard", request.url)),
    );
  }

  return applySecurityHeaders(NextResponse.next());
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/onboarding/:path*",
    "/login",
    "/register",
  ],
};
