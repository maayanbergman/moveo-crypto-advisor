# Moveo AI Crypto Advisor Dashboard

A personalized crypto investor dashboard built for the Moveo technical assignment. After secure registration and a short onboarding quiz, users receive a daily desk of preference-aware market content with interactive feedback for future model alignment.

---

## 1. Project Overview

**Moveo Crypto Advisor** helps crypto investors stay informed without noise. Users choose their assets, investor persona, and content preferences; the app then curates a daily dashboard around four widgets:

| Widget | Purpose |
| --- | --- |
| **Coin Prices** | Live quotes for the user’s selected assets, with 24h change indicators |
| **Market News** | Headlines prioritized by watchlist assets (with offline fallback content) |
| **AI Insight of the Day** | Actionable, investor-specific analysis tailored to profile and assets |
| **Fun Crypto Meme** | A daily crypto culture card (Reddit when available, static fallback otherwise) |

Each section supports **Thumbs Up / Thumbs Down** voting. Feedback is persisted in PostgreSQL for downstream personalization and LLM alignment experiments.

---

## 2. Tech Stack

- **Framework:** Next.js (App Router), React, TypeScript  
- **Styling:** Tailwind CSS, Lucide React  
- **ORM & Database:** Prisma + PostgreSQL (Neon)  
- **Auth:** JWT in HttpOnly cookies (`jose`), bcrypt password hashing  
- **Validation:** Zod (client and server)  
- **External APIs:**
  - **CoinGecko** — live prices (`/api/v3/simple/price`)
  - **CryptoPanic** — market news (+ structured fallback JSON)
  - **OpenRouter / Hugging Face** — AI insights (+ deterministic mock playbook)
  - **Reddit** — crypto memes (+ curated static fallback)

---

## 3. Setup Instructions

### Prerequisites

- Node.js 20+
- npm
- A PostgreSQL database (Neon recommended)

### Steps

**1. Clone the repository**

```bash
git clone <your-repo-url> moveo-crypto-advisor
cd moveo-crypto-advisor
```

**2. Install dependencies**

```bash
npm install
```

**3. Configure environment variables**

```bash
cp .env.example .env
```

Edit `.env` with at least:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST/DB?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
APP_URL="http://localhost:3000"
```

Optional keys (app still runs via fallbacks if omitted):

```env
CRYPTOPANIC_API_KEY=""
OPENROUTER_API_KEY=""
OPENROUTER_MODEL="openai/gpt-4o-mini"
HUGGINGFACE_API_KEY=""
```

**4. Sync the database schema**

```bash
npx prisma db push
```

**5. Start the app**

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000), create an account, complete onboarding, and open the dashboard.

---

## 4. AI Collaboration Summary

This project was built in **Cursor** with **Claude 3.5 Sonnet** acting as a pair-programmer. AI was used to accelerate boilerplate—component scaffolding, form shells, Prisma drafts, and external API service stubs—while I directed the architecture and quality bar. Specifically, I steered the implementation toward **N+1 prevention** (load `UserPreference` once on the dashboard parent and pass typed props into Server Component widgets), **React Suspense** for non-blocking widget streaming with skeleton fallbacks, **strict Zod validation** across auth, onboarding, and feedback at both client and server boundaries, and **security/error hardening** (HttpOnly JWTs, bcrypt hashing, AbortController timeouts, graceful offline fallbacks with explicit UI indicators, and duplicate-vote protection on feedback mutations). AI shortened iteration time; design trade-offs, data integrity, and resilience remained human-owned.

---

## 5. Bonus — Future Model Improvements

Thumbs Up/Down votes stored in the `Feedback` table are more than UX polish—they are labeled preference data for aligning future LLM behavior to real investor profiles.

### Direct Preference Optimization (DPO)

For each AI insight, the system can persist the generation context \(x\) (investor type, assets, content preferences, price snapshot) with the model completion. An **UP** marks that completion as preferred (\(y_w\)); a **DOWN** (or a competing regeneration that loses) becomes rejected (\(y_l\)). Aggregating these triples \((x, y_w, y_l)\) yields a DPO dataset. Fine-tuning an instruction model with DPO increases the likelihood of responses that match observed taste—for example, patient allocation guidance for HODLers versus analytical risk/level language for Day Traders—without requiring a full RLHF reward-model pipeline. A few hundred clean pairs per persona can already reduce generic macro filler and improve tone fit.

### Few-Shot In-Context Learning

While labeled volume is still low for fine-tuning, the same feedback supports **few-shot prompting**. A retrieval step can pull the highest-upvoted insights for a given `investorType` (and optionally overlapping assets) and inject them as exemplars in the system prompt. Repeatedly downvoted patterns become negative constraints (“avoid hype,” “avoid vague macro essays”). Prompt versions can be A/B tested while new votes continuously refresh the exemplar pool—forming a closed loop from dashboard interaction → preference memory → better next-day personalization, with DPO as the longer-horizon offline alignment step once data quality and volume thresholds are met.

---

Built as a technical assignment for **Moveo**.
