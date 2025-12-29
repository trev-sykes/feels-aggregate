import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";
import { getMoodSummary } from "./lib/moodSummary";

export const metadata: Metadata = {
  title: "Feels Aggregate – How is the world feeling right now?",
  description:
    "Anonymous real-time mood tracker. Vote how you feel and see a live 24-hour global emotion heatmap.",
  openGraph: {
    title: "Feels Aggregate – Live Global Mood Heatmap",
    description: "The world is mostly [feeling] right now 😊😢😠 See the live 24-hour emotion timeline.",
    url: "https://feelsaggregate.com",
    siteName: "Feels Aggregate",
    images: [
      {
        url: "/api/og-image", // Changed from static image.png to dynamic route
        width: 1200,
        height: 630,
        alt: "Live global emotion heatmap",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Feels Aggregate – Live Global Mood Heatmap",
    description: "Anonymous votes. Real-time vibes.",
    images: ["/api/og-image"], // Changed from static image.png
  },
  robots: "index, follow",
  themeColor: "#0f172a",
};

export default async function Page() {
  const moodSummary = await getMoodSummary();
  return <HomePageClient initialMoodSummary={moodSummary} />;
}