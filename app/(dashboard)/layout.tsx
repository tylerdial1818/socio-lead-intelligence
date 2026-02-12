"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { useStats } from "@/hooks/use-stats";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const { data: stats } = useStats();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-zinc-900" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-zinc-50">
      <Sidebar
        user={user}
        lastSyncAt={stats?.lastSyncAt}
        onLogout={() => logout()}
      />
      <main className="ml-64 p-8 pb-16">
        {children}
        <footer className="mt-12 text-center">
          <p className="text-xs text-zinc-400">Built and Powered by Dialed Intelligence LLC</p>
        </footer>
      </main>
    </div>
  );
}
