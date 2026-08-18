import Link from "next/link";
import { Home } from "lucide-react";

import { Button } from "@/components/ui/button";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-white">
            <Home className="h-4 w-4" />
          </div>
          <span className="font-display text-lg font-semibold text-navy-900">EstateAI</span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-ink-soft md:flex">
          <a href="#solution" className="hover:text-navy-900">
            How it works
          </a>
          <a href="#features" className="hover:text-navy-900">
            Features
          </a>
          <a href="#pricing" className="hover:text-navy-900">
            Pricing
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/login">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/signup">Start Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
