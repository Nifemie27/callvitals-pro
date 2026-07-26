import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { API_BASE_URL } from "@/constants/config";
import { useAuth } from "@/features/auth/AuthContext";

const THEME_OPTIONS = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
] as const;

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user } = useAuth();

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Settings"
        description="Appearance, account, and platform details for this workspace."
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Account</CardTitle>
          <CardDescription>Your identity and access level on this platform.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border bg-secondary/60 px-3.5 py-2.5">
            <div>
              <div className="text-sm font-medium">{user?.name}</div>
              <div className="text-xs text-muted-foreground">{user?.email}</div>
            </div>
            <Badge variant={user?.role === "ADMIN" ? "default" : "outline"}>
              {user?.role === "ADMIN" ? "Admin" : "Analyst"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Appearance</CardTitle>
          <CardDescription>
            Choose how CallVitals looks on this device. System follows your
            OS setting and updates automatically if it changes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="inline-flex gap-1 rounded-lg border bg-secondary p-1">
            {THEME_OPTIONS.map((option) => (
              <Button
                key={option.value}
                type="button"
                size="sm"
                variant="ghost"
                aria-pressed={theme === option.value}
                onClick={() => setTheme(option.value)}
                className={cn(
                  "gap-1.5 text-muted-foreground",
                  theme === option.value &&
                    "bg-card text-foreground shadow-sm",
                )}
              >
                <option.icon className="size-3.5" aria-hidden="true" />
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Platform</CardTitle>
          <CardDescription>
            Call records are served through the CallVitals Pro backend below,
            secured with JWT authentication and role-based access control.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <code className="block truncate rounded-md border bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {API_BASE_URL}
          </code>
        </CardContent>
      </Card>
    </div>
  );
}
