import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  tone?: "default" | "critical";
  isLoading?: boolean;
}

export function KpiCard({
  icon: Icon,
  label,
  value,
  subtitle,
  extra,
  tone = "default",
  isLoading,
}: KpiCardProps) {
  if (isLoading) {
    return (
      <Card className="gap-2.5 p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="size-7 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-16" />
        <Skeleton className="h-3 w-24" />
      </Card>
    );
  }

  return (
    <Card className="gap-2.5 p-4 transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">
          {label}
        </span>
        <span
          className={cn(
            "flex size-7 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground",
            tone === "critical" && "bg-destructive/10 text-destructive",
          )}
        >
          <Icon className="size-3.5" strokeWidth={1.8} aria-hidden="true" />
        </span>
      </div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      {extra}
      {subtitle && (
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      )}
    </Card>
  );
}
