import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";
import { toast } from "sonner";
import * as authApi from "@/services/api/auth.api";
import { setAccessToken } from "@/services/auth/tokenStore";
import { setSessionExpiredHandler } from "@/services/api/client";
import type { User } from "@/types/auth";
import type { LoginInput, RegisterInput } from "@/services/api/auth.api";

function isDefinitelyLoggedOut(error: unknown): boolean {
  return (
    axios.isAxiosError(error) &&
    (error.response?.status === 401 || error.response?.status === 403)
  );
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

interface AuthContextValue {
  user: User | null;
  isInitializing: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: RegisterInput) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession(): Promise<void> {
      try {
        const session = await authApi.refresh();
        if (cancelled) return;
        setAccessToken(session.accessToken);
        setUser(session.user);
      } catch (firstError) {
        // A network error or timeout (e.g. a free-tier backend waking up
        // from being idle) doesn't tell us the user is logged out, just
        // that this attempt didn't complete in time. Give it one more try
        // before falling back to the login page. A real 401/403 means the
        // server actively rejected the refresh token, so there's no point
        // retrying that.
        if (!isDefinitelyLoggedOut(firstError) && !cancelled) {
          try {
            await wait(3000);
            if (cancelled) return;
            const session = await authApi.refresh();
            if (!cancelled) {
              setAccessToken(session.accessToken);
              setUser(session.user);
            }
            return;
          } catch {
            // fall through to the logged-out state below
          }
        }
        if (cancelled) return;
        setAccessToken(null);
        setUser(null);
      } finally {
        if (!cancelled) setIsInitializing(false);
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setSessionExpiredHandler(() => {
      setUser(null);
      toast.error("Your session has expired. Please sign in again.");
    });
    return () => setSessionExpiredHandler(() => undefined);
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const session = await authApi.login(input);
    setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authApi.register(input);
    setAccessToken(session.accessToken);
    setUser(session.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      setAccessToken(null);
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({ user, isInitializing, login, register, logout }),
    [user, isInitializing, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function useIsAdmin(): boolean {
  const { user } = useAuth();
  return user?.role === "ADMIN";
}
