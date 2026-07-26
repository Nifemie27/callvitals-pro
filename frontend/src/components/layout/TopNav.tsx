import { useLocation, useNavigate } from "react-router-dom";
import { useTheme } from "next-themes";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, Sun, Moon, User, LogOut } from "lucide-react";
import { NAV_ITEMS } from "@/constants/nav";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MobileNav } from "@/components/layout/MobileNav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthContext";

export function TopNav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { resolvedTheme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const { user, logout } = useAuth();
  const isRefreshing = useIsFetching() > 0;

  const activeItem = NAV_ITEMS.find((item) =>
    item.to === "/" ? pathname === "/" : pathname.startsWith(item.to),
  );

  async function handleRefresh() {
    await queryClient.invalidateQueries();
    toast.success("Data refreshed");
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  const initials = user?.name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2.5 border-b bg-card px-4 print:hidden sm:gap-3.5 sm:px-6">
      <MobileNav />
      <div>
        <div className="text-[15px] font-semibold tracking-tight">
          {activeItem?.label ?? "CallVitals"}
        </div>
      </div>

      <div className="flex-1" />

      <Button
        variant="ghost"
        size="icon"
        aria-label="Refresh data"
        title="Refresh data"
        disabled={isRefreshing}
        onClick={() => void handleRefresh()}
      >
        <RefreshCw
          className={cn("size-4", isRefreshing && "animate-spin")}
          aria-hidden="true"
        />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Toggle dark mode"
        title="Toggle theme"
        onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      >
        {resolvedTheme === "dark" ? (
          <Sun className="size-4" aria-hidden="true" />
        ) : (
          <Moon className="size-4" aria-hidden="true" />
        )}
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" aria-label="Account menu">
            <Avatar className="size-8">
              <AvatarFallback>{initials || <User className="size-4" />}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>
            <div className="font-medium">{user?.name}</div>
            <div className="text-xs font-normal text-muted-foreground">{user?.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => void handleLogout()}>
            <LogOut className="size-3.5" aria-hidden="true" />
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
