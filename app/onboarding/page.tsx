import { redirect } from "next/navigation";
import { OnboardingQuiz } from "@/components/onboarding/onboarding-quiz";
import { getSessionFromCookies } from "@/lib/auth";
import { toUserPreferenceData } from "@/lib/preferences";
import { prisma } from "@/lib/prisma";

export default async function OnboardingPage() {
  const session = await getSessionFromCookies();
  if (!session) {
    redirect("/login");
  }

  let initialPreference = null;
  try {
    const preferenceRow = await prisma.userPreference.findUnique({
      where: { userId: session.userId },
    });
    if (preferenceRow) {
      initialPreference = toUserPreferenceData(preferenceRow);
    }
  } catch (error) {
    console.error("onboarding preference hydrate failed", error);
  }

  return (
    <main className="flex flex-1 items-center justify-center px-6 py-12">
      <OnboardingQuiz initialPreference={initialPreference} />
    </main>
  );
}
