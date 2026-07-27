import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/features/auth/AuthContext";
import { loginSchema, type LoginFormValues } from "@/features/auth/schemas";
import { ApiError } from "@/services/api/client";
import loginHero from "@/assets/login-hero.jpg";

interface LocationState {
  from?: { pathname: string };
}

export function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formError, setFormError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  if (user) {
    const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  async function onSubmit(values: LoginFormValues) {
    setFormError(null);
    try {
      await login(values);
      const redirectTo = (location.state as LocationState | null)?.from?.pathname ?? "/";
      navigate(redirectTo, { replace: true });
    } catch (error) {
      setFormError(
        error instanceof ApiError ? error.message : "Unable to sign in. Please try again.",
      );
    }
  }

  return (
    <div className="flex min-h-svh bg-background">
      <div className="flex w-full items-center justify-center px-4 py-10 lg:w-1/2">
        <Card className="w-full max-w-sm border-none shadow-none lg:border lg:shadow-sm">
          <CardHeader className="items-center text-center">
            <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-sidebar-primary to-violet-600">
              <Phone className="size-5 text-white" strokeWidth={2} />
            </div>
            <CardTitle className="text-lg">Sign in to CallVitals</CardTitle>
            <CardDescription>Telecom intelligence platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => void handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email.message}</p>
                )}
              </div>

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-destructive">{errors.password.message}</p>
                )}
              </div>

              {formError && <p className="text-xs text-destructive">{formError}</p>}

              <Button type="submit" disabled={isSubmitting} className="mt-1 w-full">
                {isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              No account?{" "}
              <Link to="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
                Create one
              </Link>
            </p>

            <div className="mt-5 rounded-lg border bg-secondary/60 px-3 py-2.5 text-[11.5px] leading-relaxed text-muted-foreground">
              <span className="font-medium text-foreground">Demo accounts:</span>{" "}
              admin@callvitals.dev / Admin123!Change (full access) &middot;
              analyst@callvitals.dev / Analyst123!Change (view-only)
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="relative hidden p-4 lg:block lg:w-1/2">
        <div className="relative size-full overflow-hidden rounded-3xl shadow-2xl">
          <img
            src={loginHero}
            alt=""
            className="size-full object-cover object-[22%_35%]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-transparent to-black/70" />

          <div className="absolute inset-x-6 top-6 flex items-center justify-between text-white">
            <span className="text-sm font-semibold">CallVitals</span>
            <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
              Telecom Platform
            </span>
          </div>

          <div className="absolute inset-x-6 bottom-6 text-white">
            <p className="text-lg font-semibold">Clarity in every call.</p>
            <p className="mt-1 text-sm text-white/80">
              Monitor, analyze, and export call data records in real time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
