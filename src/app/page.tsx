import { Metadata } from "next";
import { WalletProvider } from "@/components/wallet/walletProvider";
import { VeoPromptGenerator } from "@/components/veo/veoPromptGenerator";
import { Header } from "@/components/header";
import { HeroSection } from "@/components/hero/hero-section";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from 'sonner';

export const metadata: Metadata = {
  title: "AI-Powered Veo 3.1 Prompt Generator | Arcadia",
  description:
    "Generate optimized video prompts for Google's Veo 3.1 AI model with blockchain micropayments on Scroll network.",
  keywords: [
    "Veo 3.1",
    "AI video generation",
    "video prompts",
    "blockchain payments",
    "x402 protocol",
    "Scroll network",
  ],
  openGraph: {
    title: "AI-Powered Veo 3.1 Prompt Generator | Arcadia",
    description:
      "Generate optimized video prompts for Google's Veo 3.1 with AI and blockchain payments.",
    type: "website",
    url: "http://localhost:3000",
    siteName: "Arcadia",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI-Powered Veo 3.1 Prompt Generator | Arcadia",
    description:
      "Generate optimized video prompts for Google's Veo 3.1 with AI and blockchain payments.",
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
    <WalletProvider>
      <div className="min-h-screen bg-background">
        <Header />
        <main>
          <HeroSection />
          <section id="generator" className="py-16">
            <VeoPromptGenerator />
          </section>
        </main>
        <Toaster />
        <Sonner />
      </div>
    </WalletProvider>
  );
}
