# Moveo AI Crypto Advisor Dashboard

Personalized crypto investor dashboard built with **Next.js (App Router)**, **Prisma + PostgreSQL (Neon)**, JWT auth, CoinGecko prices, CryptoPanic news (with fallback), mockable LLM insights, and daily memes with thumbs up/down feedback.

## Features

- Email/password registration & login (bcrypt + JWT in HttpOnly cookie)
- First-login onboarding quiz → `UserPreference`
- Dashboard widgets: prices, news, AI insight, meme
- Per-section feedback (`UP` / `DOWN`) stored in `Feedback`
- Graceful external API fallbacks + loading skeletons
- Route protection via Next.js 16 `proxy.ts`

## Tech stack

| Layer | Choice |
| --- | --- |
| Framework | Next.js 16 + React 19 + TypeScript |
| Styling | Tailwind CSS 4 + Lucide React (fintech dark theme) |
| DB / ORM | PostgreSQL + Prisma 6 |
| Auth | JWT (`jose`) in HttpOnly cookie + bcryptjs |
| Prices | CoinGecko `/api/v3/simple/price` |
| News | CryptoPanic API + local fallback JSON |
| AI | OpenRouter → Hugging Face → deterministic mock playbook |
| Memes | Reddit hot listing + static Unsplash fallback |

## Project structure

```text
app/                  # App Router pages + API route handlers
components/
  auth/               # Login / register forms
  onboarding/         # Preference quiz
  dashboard/          # Widgets + header
  ui/                 # Shared UI (cards, skeletons, votes)
lib/                  # Auth, Prisma, validation, constants
services/             # External data clients
prisma/schema.prisma  # User, UserPreference, Feedback
proxy.ts              # Auth gate for protected routes
types/                # Shared TypeScript models
```

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env` and fill values:

```bash
cp .env.example .env
```

Minimum required:

```env
DATABASE_URL="postgresql://..."
JWT_SECRET="a-long-random-secret"
```

Optional:

- `CRYPTOPANIC_API_KEY`
- `OPENROUTER_API_KEY` / `OPENROUTER_MODEL`
- `HUGGINGFACE_API_KEY`
- `APP_URL`

### 3. Push the schema

```bash
npm run db:push
# or: npx prisma migrate dev --name init
```

### 4. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Smoke-test flow

1. Register → onboarding quiz → dashboard
2. Confirm prices/news/AI/meme widgets load (fallback badges are OK without keys)
3. Click thumbs up/down on each section
4. Log out and sign back in

## Deploy on Vercel + Neon

1. Create a Neon project and copy the pooled connection string into `DATABASE_URL`.
2. Push the schema locally (`npm run db:push`) or run migrations in CI.
3. Import the GitHub repo into Vercel.
4. Set environment variables in the Vercel project:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - optional API keys listed above
   - `APP_URL` = your production URL
5. Deploy. Prisma client is generated via `postinstall` / `build` scripts.

## API overview

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/api/auth/register` | Create user + set JWT cookie |
| POST | `/api/auth/login` | Authenticate + set JWT cookie |
| POST | `/api/auth/logout` | Clear cookie |
| GET | `/api/auth/me` | Current user + preferences |
| GET/POST | `/api/preferences` | Read/upsert onboarding answers |
| GET | `/api/prices` | CoinGecko prices for user assets |
| GET | `/api/news` | CryptoPanic / fallback news |
| GET | `/api/ai-insight` | Personalized daily insight |
| GET | `/api/meme` | Reddit / fallback meme |
| POST | `/api/feedback` | Persist section rating |

## Interaction log (AI-assisted development)

As requested by Moveo, this project was developed with AI pair-programming assistance in Cursor:

1. **Scaffolding & stack alignment** — Inspected the existing Next.js 16 starter, read local `node_modules/next/dist/docs` (notably Proxy replacing Middleware), and aligned auth gating to `proxy.ts`.
2. **Schema & auth** — Generated Prisma models (`User`, `UserPreference`, `Feedback`), JWT cookie helpers with `jose`, and bcrypt password hashing.
3. **Service layer** — Implemented CoinGecko, CryptoPanic (+ fallback corpus), OpenRouter/HF/mock AI client, and Reddit meme scraper with static fallback.
4. **API surface** — Built modular App Router route handlers with Zod validation and consistent error responses.
5. **UI** — Auth forms, multi-step onboarding, dashboard widgets with loading skeletons and immediate vote mutations.
6. **Hardening** — Env example, Vercel/Neon deploy notes, and this architecture write-up for feedback → LLM alignment.

Human review remained responsible for secrets handling, Neon credentials, and final acceptance of UX/copy.

## Bonus: using feedback for LLM alignment

Collected `Feedback` rows are a lightweight preference dataset. A practical pipeline:

### 1. Label construction

Join votes to the content that was shown:

- `section` + `itemId` + prompt/context snapshot (store prompt hash or content text in a future `ContentSnapshot` table)
- `rating = UP` → preferred / chosen
- `rating = DOWN` → rejected

For AI insights specifically, store `{prompt, completion}` when generating so votes attach to exact model outputs.

### 2. Preference pairs for DPO / RLHF-style training

Build pairs `(x, y_w, y_l)` where:

- `x` = user profile features (assets, investorType, contentTypes) + market context
- `y_w` = completion that received `UP` (or higher win-rate)
- `y_l` = completion that received `DOWN`

Train with Direct Preference Optimization (DPO) or Odds-Ratio Preference Optimization (ORPO) on an open instruction model. Even a few hundred clean pairs can visibly reduce tone/mismatch for a niche product voice.

### 3. Few-shot / prompt tuning without fine-tuning

Cheaper loop while data is sparse:

1. Cluster high-UP insights by investor type.
2. Inject 2–3 winning exemplars into the system prompt (“examples of helpful answers for HODLers”).
3. Negatively constrain with DOWN patterns (“avoid hype; avoid generic macro essays”).
4. A/B the prompt version id; continue collecting votes.

### 4. Ranking & retrieval

For news/memes/prices, treat votes as CTR-like rewards:

- Re-rank CryptoPanic items with a lightweight model `P(UP | user, item features)`
- Down-weight sources/topics with repeated `DOWN`
- Personalize meme selection by source and title embeddings

### 5. Safety & quality gates

- Require minimum votes before promoting an exemplar
- Detect brigading / accidental double votes (unique constraint on user+item+day)
- Separate entertainment (MEME) rewards from advisory (AI_INSIGHT) rewards so meme humor does not train the advisor tone

### Suggested next schema additions

```prisma
model ContentSnapshot {
  id        String   @id @default(cuid())
  section   FeedbackSection
  itemId    String
  prompt    String?
  content   String
  model     String?
  createdAt DateTime @default(now())
}
```

This closes the loop from dashboard interaction → preference data → better personalization.

## License

Built as a technical assignment for Moveo.
