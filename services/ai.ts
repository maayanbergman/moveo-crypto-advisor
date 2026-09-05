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

function buildMockInsight(input: InsightInput): AiInsight {
  const assets = input.assets.length ? input.assets.join(", ") : "BTC, ETH";
  const focus = input.contentTypes[0] ?? "Market News";

  const playbooks: Record<InvestorType, { title: string; actions: string[] }> =
    {
      HODLer: {
        title: "Accumulate on weakness, ignore noise",
        actions: [
          `DCA into ${assets} on dips below your 30-day average.`,
          "Rebalance only if any single asset exceeds 40% of crypto allocation.",
          "Park dry powder in stables for weekly buys rather than FOMO entries.",
        ],
      },
      "Day Trader": {
        title: "Trade the range, cut losers fast",
        actions: [
          `Watch ${assets} for liquidity sweeps around prior day highs/lows.`,
          "Size positions so a 1.5R stop does not exceed 1% of portfolio risk.",
          "Skip low-volume midday chop; focus on open and US session overlap.",
        ],
      },
      "NFT Collector": {
        title: "Follow blue-chip floors, not every mint",
        actions: [
          `Use ${assets} strength as a risk-on signal for secondary market bids.`,
          "Prefer collections with sticky royalties and active creator roadmaps.",
          "Cap speculative mints at a fixed weekly budget.",
        ],
      },
      Degen: {
        title: " asymmetric bets with defined max loss",
        actions: [
          `Rotate a small sleeve of ${assets} into high-beta narratives you already understand.`,
          "Never size a meme/perp idea above an amount you can lose overnight.",
          "Take partial profits into strength; leave a runner, not your entire bag.",
        ],
      },
    };

  const playbook = playbooks[input.investorType] ?? playbooks.HODLer;

  return {
    id: `insight-${daySeed()}-${input.investorType}`,
    title: playbook.title,
    summary: `Hey ${input.name.split(" ")[0]}, as a ${input.investorType} focused on ${focus}, today's edge is staying aligned with ${assets}. ${input.priceSnapshot ? `Live tape: ${input.priceSnapshot}. ` : ""}Prioritize process over prediction — the market pays consistency more than hot takes.`,
    actionItems: playbook.actions,
    generatedAt: new Date().toISOString(),
    model: "local-mock-playbook",
    mocked: true,
  };
}

export async function generateAiInsight(
  input: InsightInput,
): Promise<AiInsight> {
  const openRouterKey = process.env.OPENROUTER_API_KEY;
  const huggingFaceKey = process.env.HUGGINGFACE_API_KEY;
  const prompt = `You are a concise crypto advisor. Write JSON with keys title, summary, actionItems (array of 3 short strings).
User: ${input.name}
Investor type: ${input.investorType}
Assets: ${input.assets.join(", ")}
Preferred content: ${input.contentTypes.join(", ")}
Price snapshot: ${input.priceSnapshot ?? "n/a"}
Keep tone practical, non-hype, and actionable for today only.`;

  if (openRouterKey) {
    try {
      const response = await fetch(
        "https://openrouter.ai/api/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": process.env.APP_URL ?? "http://localhost:3000",
            "X-Title": "Moveo Crypto Advisor",
          },
          body: JSON.stringify({
            model:
              process.env.OPENROUTER_MODEL ?? "openai/gpt-4o-mini",
            messages: [
              {
                role: "system",
                content:
                  "Return only valid JSON: {title, summary, actionItems: string[]}",
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
        actionItems: parsed.actionItems?.slice(0, 5) ?? [],
        generatedAt: new Date().toISOString(),
        model: data.model ?? "openrouter",
        mocked: false,
      };
    } catch {
      // fall through to HF / mock
    }
  }

  if (huggingFaceKey) {
    try {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${huggingFaceKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            inputs: prompt,
            parameters: { max_new_tokens: 280, return_full_text: false },
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
          summary: text.trim().slice(0, 600),
          actionItems: [
            "Review positions against today's volatility.",
            "Confirm risk limits before adding size.",
            "Log one lesson from today's tape for tomorrow.",
          ],
          generatedAt: new Date().toISOString(),
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          mocked: false,
        };
      }
    } catch {
      // fall through to mock
    }
  }

  return buildMockInsight(input);
}
