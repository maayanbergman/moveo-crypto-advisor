import type { Metadata } from "next";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Moveo Crypto Advisor | AI Investor Dashboard",
    template: "%s | Moveo Crypto Advisor",
  },
  description:
    "Personalized AI crypto advisor dashboard with live coin prices, curated market news, daily investor insights, and community memes — tailored to your onboarding preferences.",
  keywords: [
    "crypto advisor",
    "AI crypto dashboard",
    "Bitcoin prices",
    "crypto news",
    "investor insights",
    "Moveo",
  ],
  applicationName: "Moveo Crypto Advisor",
  authors: [{ name: "Moveo Crypto Advisor" }],
  openGraph: {
    title: "Moveo Crypto Advisor",
    description:
      "Your daily AI desk for crypto decisions — prices, news, insights, and feedback loops.",
    type: "website",
    locale: "en_US",
    siteName: "Moveo Crypto Advisor",
  },
  twitter: {
    card: "summary_large_image",
    title: "Moveo Crypto Advisor",
    description:
      "Personalized crypto dashboard with AI insights, live prices, and curated news.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-950 text-slate-100">
        {children}
      </body>
    </html>
  );
}
