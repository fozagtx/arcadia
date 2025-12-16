import { Metadata } from "next";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero/hero-section";

export const metadata: Metadata = {
  title: "AI-Powered UGC Ad Generation | Arcads",
  description:
    "Arcads helps brands turn ideas into high-converting TikTok ad briefs powered by an agentic workflow and on-chain micropayments.",
  keywords: [
    "UGC ads",
    "TikTok ads",
    "AI ad generation",
    "creator briefs",
    "ad automation",
    "micropayments",
  ],
  openGraph: {
    title: "AI-Powered UGC Ad Generation | Arcads",
    description:
      "Turn ideas into high-converting TikTok ad briefs with AI-powered workflows.",
    type: "website",
    url: "https://b025820c-1f85-4fb5-915b-8d1841351816.canvases.tempo.build",
    siteName: "Arcads",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered UGC Ad Generation | Arcads",
    description:
      "Turn ideas into high-converting TikTok ad briefs with AI-powered workflows.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
    </div>
  );
}
