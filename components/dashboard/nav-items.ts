import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Users,
  Building2,
  UserSquare2,
  BarChart3,
  Settings,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads", href: "/dashboard/leads", icon: Users },
  { label: "Properties", href: "/dashboard/properties", icon: Building2 },
  { label: "Agents", href: "/dashboard/agents", icon: UserSquare2 },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
];
