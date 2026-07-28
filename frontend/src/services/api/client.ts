import axios, { type InternalAxiosRequestConfig } from "axios";
import { API_BASE_URL } from "@/constants/config";
import { getAccessToken, setAccessToken } from "@/services/auth/tokenStore";
import type { ApiErrorEnvelope, ApiSuccessEnvelope } from "@/types/api";
import type { AuthSession } from "@/types/auth";

export class ApiError extends Error {
  readonly status?: number;
  readonly errors?: unknown;

  constructor(message: string, status?: number, errors?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retriedAfterRefresh?: boolean;
}

/** Set by AuthProvider so the interceptor can react when a refresh attempt fails. */
let onSessionExpired: (() => void) | null = null;
export function setSessionExpiredHandler(handler: () => void): void {
  onSessionExpired = handler;
}

// Render's free plan spins the backend down after ~15 minutes of idle, and
// waking it back up (plus Neon's own serverless Postgres cold start behind
// it) can take upwards of 45-50s in the worst case. A shorter timeout here
// turns a perfectly healthy wake-up into a false "network error" for the
// user, so this needs to comfortably outlast that, not just a normal request.
const COLD_START_TOLERANT_TIMEOUT = 60_000;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: COLD_START_TOLERANT_TIMEOUT,
  withCredentials: true,
});

function isTimeout(error: unknown): boolean {
  return axios.isAxiosError(error) && error.code === "ECONNABORTED";
}

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

const AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH = ["/auth/login", "/auth/register", "/auth/refresh"];

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  refreshPromise ??= axios
    .post<ApiSuccessEnvelope<AuthSession>>(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true, timeout: COLD_START_TOLERANT_TIMEOUT },
    )
    .then((response) => {
      const token = response.data.data.accessToken;
      setAccessToken(token);
      return token;
    })
    .catch((error: unknown) => {
      // Only a genuine rejection from the server (refresh token missing,
      // expired, revoked) means the session is actually over. A timeout,
      // network error, or 5xx just means the request didn't complete, most
      // often a free-tier backend waking up from being idle, and the
      // user's actual session (the refresh cookie) may still be perfectly
      // valid. Forcing a logout for that would be wrong, so only clear the
      // session on a real 401/403 from the refresh endpoint itself.
      const isRejectedByServer =
        axios.isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 403);

      if (isRejectedByServer) {
        setAccessToken(null);
        onSessionExpired?.();
      }
      return null;
    })
    .finally(() => {
      refreshPromise = null;
    });

  return refreshPromise;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }

    const config = error.config as RetriableRequestConfig | undefined;
    const isExemptFromRefresh = AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH.some((path) =>
      config?.url?.includes(path),
    );

    if (
      error.response?.status === 401 &&
      config &&
      !config._retriedAfterRefresh &&
      !isExemptFromRefresh
    ) {
      config._retriedAfterRefresh = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        config.headers.set("Authorization", `Bearer ${newToken}`);
        return apiClient(config);
      }
    }

    const body = error.response?.data as ApiErrorEnvelope | undefined;
    const message =
      body?.message ??
      (error.response
        ? `Request failed with status ${error.response.status}`
        : isTimeout(error)
          ? "The server is waking up after being idle, this can take up to a minute. Please try again."
          : "Network error, the backend could not be reached");

    return Promise.reject(new ApiError(message, error.response?.status, body?.errors));
  },
);
