import { clearAuthCookie } from "@/lib/auth";
import { jsonOk } from "@/lib/api";

export async function POST() {
  const response = jsonOk({ success: true });
  clearAuthCookie(response);
  return response;
}
