"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home } from "lucide-react";

import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";

export function Sidebar({ agencyName }: { agencyName: string }) {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-card lg:flex">
      <div className="flex h-16 items-center gap-2 border-b border-border px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-white">
          <Home className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="font-display text-sm font-semibold leading-tight text-navy-900">
            EstateAI
          </p>
          <p className="truncate text-xs leading-tight text-muted-foreground">{agencyName}</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-navy-900 text-white"
                  : "text-ink-soft hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-border p-4">
        <p className="font-mono text-[11px] uppercase tracking-wide text-muted-foreground">
          Turn every enquiry into an opportunity.
        </p>
      </div>
    </aside>
  );
}
