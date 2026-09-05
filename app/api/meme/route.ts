import { jsonError, jsonOk, requireAuthUser } from "@/lib/api";
import { fetchCryptoMeme } from "@/services/memes";

export async function GET() {
  const auth = await requireAuthUser();
  if ("response" in auth) return auth.response;

  try {
    const result = await fetchCryptoMeme();
    return jsonOk(result);
  } catch (error) {
    console.error("meme error", error);
    return jsonError("Unable to load meme", 500);
  }
}
