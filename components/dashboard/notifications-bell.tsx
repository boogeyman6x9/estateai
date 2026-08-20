"use client";

import Link from "next/link";
import { Bell, Calendar, Flame, TriangleAlert } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Notification, NotificationType } from "@/lib/notifications";

const ICON: Record<NotificationType, React.ElementType> = {
  hot_lead: Flame,
  inspection_requested: Calendar,
  follow_up_overdue: TriangleAlert,
};

const ICON_CLASS: Record<NotificationType, string> = {
  hot_lead: "text-hot",
  inspection_requested: "text-navy-700",
  follow_up_overdue: "text-warm",
};

export function NotificationsBell({ notifications }: { notifications: Notification[] }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-full outline-none hover:bg-secondary focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-ink-soft" />
          {notifications.length > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-hot" />
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <p className="px-2 py-4 text-center text-sm text-muted-foreground">
            Nothing new right now.
          </p>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((n) => {
              const Icon = ICON[n.type];
              return (
                <DropdownMenuItem key={n.id} asChild>
                  <Link href={`/dashboard/leads/${n.leadId}`} className="flex items-start gap-2.5">
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${ICON_CLASS[n.type]}`} />
                    <span className="flex-1 whitespace-normal">
                      <span className="block text-sm text-foreground">{n.message}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(n.createdAt).toLocaleString("en-AU")}
                      </span>
                    </span>
                  </Link>
                </DropdownMenuItem>
              );
            })}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
