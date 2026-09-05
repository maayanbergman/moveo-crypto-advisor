import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AiInsightWidget } from "@/components/dashboard/ai-insight-widget";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { MemeWidget } from "@/components/dashboard/meme-widget";
import { NewsWidget } from "@/components/dashboard/news-widget";
import { PriceWidget } from "@/components/dashboard/price-widget";
import { SectionFallback } from "@/components/ui/widget-error";
import { getSessionFromCookies } from "@/lib/auth";
import { toUserPreferenceData } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  let preferenceRow;
  try {
    preferenceRow = await prisma.userPreference.findUnique({
      where: { userId: session.userId },
    });
  } catch (error) {
    console.error("dashboard preference query failed", error);
    throw error;
  }

  if (!preferenceRow) {
    redirect("/onboarding");
  }

  const preference = toUserPreferenceData(preferenceRow);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-8 md:py-10">
      <DashboardHeader
        name={session.name}
        investorType={preference.investorType}
        assets={preference.assets}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Suspense
          fallback={
            <SectionFallback
              title="Coin Prices"
              subtitle="Live quotes for your selected assets"
              rows={4}
            />
          }
        >
          <PriceWidget assets={preference.assets} />
        </Suspense>

        <Suspense
          fallback={
            <SectionFallback
              title="Market News"
              subtitle="Curated headlines prioritized by your assets"
              rows={5}
            />
          }
        >
          <NewsWidget assets={preference.assets} />
        </Suspense>

        <Suspense
          fallback={
            <SectionFallback
              title="AI Insight of the Day"
              subtitle="Actionable analysis tailored to your investor profile"
              rows={4}
            />
          }
        >
          <AiInsightWidget
            name={session.name}
            assets={preference.assets}
            investorType={preference.investorType}
            contentTypes={preference.contentTypes}
          />
        </Suspense>

        <Suspense
          fallback={
            <SectionFallback
              title="Fun Crypto Meme"
              subtitle="A daily dose of market culture"
              rows={4}
            />
          }
        >
          <MemeWidget />
        </Suspense>
      </div>
    </main>
  );
}
