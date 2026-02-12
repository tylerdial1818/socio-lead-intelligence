"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Flame, Calendar, BarChart3, Users, Settings, RefreshCw, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Opportunities", href: "/opportunities", icon: Flame },
  { name: "Calendar", href: "/calendar", icon: Calendar },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  user: { name: string; email: string } | null;
  lastSyncAt?: string | null;
  onLogout: () => void;
}

export function Sidebar({ user, lastSyncAt, onLogout }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col w-64 bg-white border-r border-zinc-200 h-screen fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-zinc-200">
        <h1 className="text-xl font-bold text-zinc-900 tracking-tight">SOCIO</h1>
        <p className="text-xs text-zinc-500 mt-1">Lead Pipeline</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-zinc-100 text-zinc-900"
                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Sync Status */}
      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <RefreshCw className="w-3 h-3" />
          <span>Last synced: {lastSyncAt || "Never"}</span>
        </div>
      </div>

      {/* User */}
      <div className="p-4 border-t border-zinc-200">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-900 truncate">{user?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{user?.email}</p>
          </div>
          <Button variant="ghost" size="sm" onClick={onLogout} className="shrink-0">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
