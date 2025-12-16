"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { HeaderBase } from "@/components/header-base";
import { ThemeSwitcher } from "@/components/theme-switcher";

export function Header() {
  const leftContent = (
    <Link href="/" className="flex items-center gap-3">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-background font-bold text-sm">
        A
      </span>
      <span className="text-xl font-medium hidden md:block text-foreground">Arcads</span>
    </Link>
  );

  const rightContent = (
    <nav className="flex items-center gap-2">
      <div className="flex items-center gap-4">
        <Link href="#docs">
          <Button variant="text" className="text-sm p-0">
            Docs
          </Button>
        </Link>
        <Link href="#faq">
          <Button variant="text" className="text-sm p-0">
            FAQ
          </Button>
        </Link>
      </div>
      <Link href="#get-started">
        <Button size="sm" className="text-sm ml-2">
          Get Started
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
      <ThemeSwitcher className="ml-2" />
    </nav>
  );

  return (
    <div className="sticky top-4 z-50 mx-4 md:mx-0">
      <HeaderBase
        className="bg-background border rounded-2xl max-w-3xl mx-auto mt-4 pl-4 pr-[11px]"
        leftContent={leftContent}
        rightContent={rightContent}
      />
    </div>
  );
}
