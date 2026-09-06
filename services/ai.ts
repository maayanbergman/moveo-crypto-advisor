import {
  AI_API_TIMEOUT_MS,
  fetchWithTimeout,
} from "@/lib/fetch";
import type {
  AiInsight,
  ContentType,
  CryptoAsset,
  InvestorType,
} from "@/types";

interface InsightInput {
  name: string;
  assets: CryptoAsset[];
  investorType: InvestorType;
  contentTypes: ContentType[];
  priceSnapshot?: string;
}

function daySeed(): string {
  return new Date().toISOString().slice(0, 10);
}

const TONE_BY_INVESTOR: Record<InvestorType, string> = {
  HODLer:
    "patient, long-term, calm — discourage FOMO and short-term noise",
  "Day Trader":
    "analytical, precise, risk-aware — focus on levels, liquidity, and risk sizing",
  "NFT Collector":
    "curatorial and selective — emphasize floors, creator quality, and budget caps",
  Degen:
    "candid about asymmetry — allow aggression only with strict max-loss rules",
};

function buildPersonalizedPrompt(input: InsightInput): string {
  const assets = input.assets.join(", ") || "BTC, ETH";
  return `You are a personalized crypto advisor for ${input.name}.

Investor type: ${input.investorType}
Tone requirement: ${TONE_BY_INVESTOR[input.investorType]}
Focus assets (must reference explicitly): ${assets}
Preferred content: ${input.contentTypes.join(", ") || "Market News"}
Price snapshot: ${input.priceSnapshot ?? "n/a"}

Return ONLY valid JSON with keys:
- title (short string)
- summary (MAXIMUM 3 sentences, tailored to this ${input.investorType} and the assets ${assets})
- actionItems (array of exactly 3 short actionable strings)

Keep the response concise for a dashboard card. No markdown fences.`;
}

function buildMockInsight(input: InsightInput): AiInsight {
  const assets = input.assets.length ? input.assets.join(", ") : "BTC, ETH";
  const firstName = input.name.split(" ")[0] || "trader";

  const playbooks: Record<
    InvestorType,
    { title: string; summary: string; actions: string[] }
  > = {
    HODLer: {
      title: "Stay patient with your core bag",
      summary: `${firstName}, as a HODLer focused on ${assets}, ignore intraday noise and stick to your DCA plan. Use weakness as an opportunity only within pre-set buy bands. Process beats prediction over multi-month horizons.`,
      actions: [
        `DCA into ${assets} only inside your written buy zones.`,
        "Cap any single asset at 40% of crypto allocation.",
        "Keep dry powder in stables for scheduled weekly buys.",
      ],
    },
    "Day Trader": {
      title: "Trade levels, not opinions",
      summary: `${firstName}, your Day Trader edge on ${assets} is reaction to liquidity, not prediction. Define invalidation before entry and size so a 1.5R stop risks ≤1% of equity. Skip low-volume midday chop.`,
      actions: [
        `Mark prior-day high/low for ${assets} before the open.`,
        "Hard-stop every idea; no average-downs mid-trade.",
        "Flat into US lunch unless volume expands.",
      ],
    },
    "NFT Collector": {
      title: "Bid quality, skip mint FOMO",
      summary: `${firstName}, use ${assets} strength as a risk-on cue for secondary bids, not every mint. Prefer sticky creator roadmaps and clear floor support. Keep speculative mints inside a fixed weekly budget.`,
      actions: [
        `Size NFT bids off ${assets} momentum, not hype threads.`,
        "Favor collections with active royalties and builders.",
        "Hard-cap weekly mint spend before browsing.",
      ],
    },
    Degen: {
      title: "Asymmetric bets, defined pain",
      summary: `${firstName}, rotate a small sleeve of ${assets} into high-beta ideas you already understand. Never size above overnight max loss. Take partials into strength and leave a runner — not the whole bag.`,
      actions: [
        `Limit degen size to a fixed % of your ${assets} sleeve.`,
        "Write the kill level before clicking buy.",
        "Bank partial profits on the first impulse candle.",
      ],
    },
  };

  const playbook = playbooks[input.investorType] ?? playbooks.HODLer;

  return {
    id: `insight-${daySeed()}-${input.investorType}`,
    title: playbook.title,
    summary: playbook.summary,
    actionItems: playbook.actions,
    generatedAt: new Date().toISOString(),
    model: "local-mock-playbook",
    mocked: true,
    isFallback: true,
  };
}

export async function generateAiInsight(
  input: InsightInput,
): Promise<AiInsight> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const huggingFaceKey = process.env.HUGGINGFACE_API_KEY;
  const prompt = buildPersonalizedPrompt(input);

  if (openRouterKey) {
    try {
      const response = await fetchWithTimeout(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          timeoutMs: AI_API_TIMEOUT_MS,
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
            "X-Title": "Moveo Crypto Advisor",
          },
          body: JSON.stringify({
            model: process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Return only valid JSON: {title, summary, actionItems: string[]}. Summary must be at most 3 sentences.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.6,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`OpenRouter ${response.status}`);
      }

      const data = (await response.json()) as {
        choices?: { message?: { content?: string } }[];
        model?: string;
      };
      const content = data.choices?.[0]?.message?.content ?? "";
      const parsed = JSON.parse(
        content.replace(/```json|```/g, "").trim(),
      ) as {
        title?: string;
        summary?: string;
        actionItems?: string[];
      };

      return {
        id: `insight-${daySeed()}-openrouter`,
        title: parsed.title ?? "AI Insight of the Day",
        summary: parsed.summary ?? "No summary returned.",
        actionItems: parsed.actionItems?.slice(0, 3) ?? [],
        generatedAt: new Date().toISOString(),
        model: data.model ?? "openrouter",
        mocked: false,
        isFallback: false,
      };
    } catch {
      // fall through to HF / mock
    }
  }

  if (huggingFaceKey) {
    try {
      const response = await fetchWithTimeout(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          timeoutMs: AI_API_TIMEOUT_MS,
          method: "POST",
          headers: {
            Authorization: `Bearer ${huggingFaceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 220, return_full_text: false },
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HuggingFace ${response.status}`);
      }

      const data = (await response.json()) as
        | { generated_text?: string }[]
        | { generated_text?: string };
      const text = Array.isArray(data)
        ? data[0]?.generated_text
        : data.generated_text;

      if (text) {
        return {
          id: `insight-${daySeed()}-hf`,
          title: "AI Insight of the Day",
          summary: text.trim().slice(0, 420),
          actionItems: [
            `Review ${input.assets.join(", ")} against today's volatility.`,
            "Confirm risk limits before adding size.",
            "Log one lesson from today's tape for tomorrow.",
          ],
          generatedAt: new Date().toISOString(),
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          mocked: false,
          isFallback: false,
        };
      }
    } catch {
      // fall through to mock
    }
  }

  return buildMockInsight(input);
}
