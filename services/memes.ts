import {
  EXTERNAL_API_TIMEOUT_MS,
  fetchWithTimeout,
} from "@/lib/fetch";
import type { MemeItem } from "@/types";

const STATIC_MEMES: MemeItem[] = [
  {
    id: "meme-hodl-chart",
    title: "When you buy the dip and it keeps dipping",
    imageUrl:
      "https://images.unsplash.com/photo-1621761191319-c6fb62004040?auto=format&fit=crop&w=900&q=80",
    source: "static-fallback",
  },
  {
    id: "meme-wagmi",
    title: "WAGMI energy after one green candle",
    imageUrl:
      "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?auto=format&fit=crop&w=900&q=80",
    source: "static-fallback",
  },
  {
    id: "meme-ngmi",
    title: "NGMI until the next airdrop rumor",
    imageUrl:
      "https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=900&q=80",
    source: "static-fallback",
  },
  {
    id: "meme-gas",
    title: "Paying more gas than the NFT is worth",
    imageUrl:
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=900&q=80",
    source: "static-fallback",
  },
  {
    id: "meme-paperhands",
    title: "Paper hands vs diamond hands debate (again)",
    imageUrl:
      "https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=900&q=80",
    source: "static-fallback",
  },
];

interface RedditListing {
  data?: {
    children?: {
      data?: {
        id?: string;
        title?: string;
        url?: string;
        permalink?: string;
        post_hint?: string;
        is_video?: boolean;
        over_18?: boolean;
      };
    }[];
  };
}

function isImageUrl(url: string): boolean {
  return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.includes("i.redd.it");
}

function pickDaily<T>(items: T[]): T {
  const day = Math.floor(Date.now() / 86_400_000);
  return items[day % items.length];
}

export async function fetchCryptoMeme(): Promise<{
  meme: MemeItem;
  source: "reddit" | "fallback";
  isFallback: boolean;
}> {
  try {
    const response = await fetchWithTimeout(
      "https://www.reddit.com/r/CryptoCurrencies/hot.json?limit=30",
      {
        timeoutMs: EXTERNAL_API_TIMEOUT_MS,
        headers: {
          Accept: "application/json",
          "User-Agent": "moveo-crypto-advisor/1.0",
        },
        next: { revalidate: 3600 },
      },
    );

    if (!response.ok) {
      throw new Error(`Reddit responded with ${response.status}`);
    }

    const listing = (await response.json()) as RedditListing;
    const memes: MemeItem[] = (listing.data?.children ?? [])
      .map((child) => child.data)
      .filter((post): post is NonNullable<typeof post> => Boolean(post))
      .filter(
        (post) =>
          !post.over_18 &&
          !post.is_video &&
          typeof post.url === "string" &&
          isImageUrl(post.url),
      )
      .map((post) => ({
        id: post.id ?? post.url!,
        title: post.title ?? "Crypto meme",
        imageUrl: post.url!,
        source: "reddit",
        permalink: post.permalink
          ? `https://reddit.com${post.permalink}`
          : undefined,
      }));

    if (memes.length === 0) {
      throw new Error("No image posts found");
    }

    return {
      meme: pickDaily(memes),
      source: "reddit",
      isFallback: false,
    };
  } catch {
    return {
      meme: pickDaily(STATIC_MEMES),
      source: "fallback",
      isFallback: true,
    };
  }
}
