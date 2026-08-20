"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, LogOut, Home } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { logoutAction } from "@/lib/actions/auth";
import { NAV_ITEMS } from "./nav-items";
import { NotificationsBell } from "./notifications-bell";
import type { Notification } from "@/lib/notifications";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Topbar({
  userName,
  userEmail,
  notifications,
}: {
  userName: string;
  userEmail: string;
  notifications: Notification[];
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const pathname = usePathname();

  const pageTitle =
    [...NAV_ITEMS].reverse().find((item) =>
      item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href)
    )?.label ?? "Dashboard";

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={() => setMobileNavOpen(true)}
          aria-label="Open navigation"
        >
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="font-display text-lg font-semibold text-navy-900">{pageTitle}</h1>
      </div>

      <div className="flex items-center gap-1">
        <NotificationsBell notifications={notifications} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar>
                <AvatarFallback>{initials(userName)}</AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>
              <p className="font-medium">{userName}</p>
              <p className="font-normal text-muted-foreground">{userEmail}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Account settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <form action={logoutAction}>
              <DropdownMenuItem asChild>
                <button type="submit" className="flex w-full items-center gap-2 text-hot">
                  <LogOut className="h-4 w-4" />
                  Log out
                </button>
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Dialog open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
        <DialogContent className="max-w-xs p-0">
          <DialogTitle className="sr-only">Navigation</DialogTitle>
          <div className="flex h-14 items-center gap-2 border-b border-border px-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-navy-900 text-white">
              <Home className="h-3.5 w-3.5" />
            </div>
            <span className="font-display text-sm font-semibold text-navy-900">EstateAI</span>
          </div>
          <nav className="space-y-1 p-3">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileNavOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                    isActive ? "bg-navy-900 text-white" : "text-ink-soft hover:bg-secondary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </DialogContent>
      </Dialog>
    </header>
  );
}
