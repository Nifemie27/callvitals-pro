import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { Skeleton } from "@/components/ui/skeleton";

export function AppShell() {
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <TopNav />
        <main className="flex flex-1 flex-col gap-4 p-4 sm:p-6">
          <Suspense fallback={<Skeleton className="h-40 w-full rounded-lg" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
