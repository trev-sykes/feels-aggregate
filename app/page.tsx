import type { Metadata } from "next";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: "Feels Aggregate – How is the world feeling right now?",
  description:
    "Anonymous real-time mood tracker. Vote how you feel and see a live 24-hour global emotion heatmap.",
  openGraph: {
    title: "Feels Aggregate – Live Global Mood Heatmap",
    description: "The world is mostly [feeling] right now 😊😢😠 See the live 24-hour emotion timeline.",
    url: "https://feels-aggregate.vercel.app",
    siteName: "Feels Aggregate",
    images: [
      {
        url: "/api/og-image",
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
    images: ["/api/og-image"],
    creator: "@freshly_mulched",
  },
  robots: "index, follow",
};

// Move themeColor here
export const viewport = {
  themeColor: "#0f172a",
};

export default async function Page() {
  return <HomePageClient />;
}
