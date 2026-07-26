import { NavLink } from "react-router-dom";
import { Phone } from "lucide-react";
import { NAV_ITEMS } from "@/constants/nav";
import { cn } from "@/lib/utils";
import { useAuth } from "@/features/auth/AuthContext";

interface SidebarContentProps {
  onNavigate?: () => void;
}

export function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { user } = useAuth();
  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiresRole || item.requiresRole === user?.role,
  );

  return (
    <div className="flex h-full flex-col gap-7 bg-sidebar px-3.5 py-5">
      <div className="flex items-center gap-2.5 px-2">
        <div className="flex size-[30px] shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-sidebar-primary to-violet-600">
          <Phone className="size-4 text-white" strokeWidth={2} />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight text-white">
            CallVitals
          </div>
          <div className="text-[11px] leading-tight text-sidebar-foreground">
            CDR Analytics
          </div>
        </div>
      </div>

      <nav className="flex flex-col gap-0.5">
        <div className="px-2.5 pb-1 text-[10.5px] font-medium uppercase tracking-wider text-sidebar-foreground/50">
          Workspace
        </div>
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13.5px] font-medium text-sidebar-foreground transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline focus-visible:outline-2 focus-visible:outline-sidebar-ring",
                isActive && "bg-sidebar-accent text-sidebar-accent-foreground",
              )
            }
          >
            <item.icon className="size-[17px]" strokeWidth={1.8} aria-hidden="true" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto px-2.5 text-[11px] leading-relaxed text-sidebar-foreground/50">
        CallVitals &middot; Call Data Record analytics for telecom &amp; VoIP
        platforms.
      </div>
    </div>
  );
}
