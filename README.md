# AI Crypto Advisor Dashboard - Moveo Task

Hi! 👋 This is my submission for the Moveo full-stack assignment. 
I built a personalized crypto dashboard that asks the user for their preferences (during onboarding) and builds a tailored experience with live prices, news, AI insights, and memes.

## My Approach
I wanted to make sure this isn't just a "working" project, but a production-ready application. I focused on clean architecture, performance, and UX. For example, I made sure to use React Suspense to prevent long API calls from blocking the page render, and I structured the database queries to avoid N+1 issues.

## Tech Stack
* **Framework:** Next.js (App Router)
* **Database:** PostgreSQL (hosted on Neon) with Prisma ORM
* **Styling:** Tailwind CSS
* **Auth:** Custom JWT with HTTP-only cookies
* **APIs:** CoinGecko, CryptoPanic, OpenRouter/HuggingFace

## How I Used AI (My Workflow)
The assignment asked to detail the AI collaboration. I used Cursor and Claude 3.5 Sonnet as my "pair programmer". Instead of letting the AI write the app blindly, I dictated the architecture and used highly specific prompts to enforce best practices. 

Here are two examples of actual prompts I used to push the code to a higher standard:

**1. Focusing on UX & Edge Cases:**
> *"I need to fix 3 specific UX bugs in the Onboarding flow... Remove ALL default values so the form initializes completely empty. Ensure the Zod validation explicitly catches empty fields... Update the onboarding page to fetch the user's existing preferences on initial load to hydrate the form."*

**2. Enforcing Strict QA & Security:**
> *"Act as a Senior QA Automation Engineer... Ensure the Login and Registration forms have strict client-side and server-side validation... Ensure the Feedback buttons have optimistic UI updates and cannot be spammed."*

## Bonus: Future Model Improvements
I added Thumbs Up/Down voting buttons to all widgets. If this were a real-world product, every vote would be saved to the database along with the user's `investorType` and the specific context. 

We could use this data in two ways:
1. **Short term (RAG):** Fetch highly-rated insights for similar users and inject them into the LLM's prompt as "few-shot examples" to instantly improve the tone.
2. **Long term (DPO):** Use the (Accepted, Rejected) pairs to fine-tune an open-source model using Direct Preference Optimization, teaching it exactly how day traders vs. long-term holders like to read their data.

---
## Setup Instructions
1. Clone the repo and run `npm install`.
2. Create a `.env` file (see `.env.example` for reference) with your `DATABASE_URL` and `JWT_SECRET`.
3. Run `npx prisma db push` to sync the database.
4. Run `npm run dev` and enjoy!