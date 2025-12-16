"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function HeroNav() {
  return (
    <header className="relative z-20 flex h-20 items-center justify-center bg-white/90 px-4 py-3 backdrop-blur-md">
      <div className="flex items-center justify-center rounded-full border border-neutral-200 bg-white/80 px-8 py-2 shadow-sm">
        <Link href="#" className="text-sm font-medium tracking-tight">
          Arcads
        </Link>
        <div className="ml-8 flex items-center gap-6 text-xs font-medium text-neutral-700">
          <Link href="#docs">Docs</Link>
          <Link href="#faq">FAQ</Link>
        </div>
      </div>
    </header>
  );
}
