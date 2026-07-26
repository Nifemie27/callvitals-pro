import { LayoutDashboard, BarChart3, FileText, Settings, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Role } from "@/types/auth";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
  /** Omit to show the item to every authenticated role. */
  requiresRole?: Role;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Analytics", to: "/analytics", icon: BarChart3 },
  { label: "Reports", to: "/reports", icon: FileText },
  { label: "Users", to: "/users", icon: Users, requiresRole: "ADMIN" },
  { label: "Settings", to: "/settings", icon: Settings },
];
