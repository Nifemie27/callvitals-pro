import { config as loadDotenv } from "dotenv";

loadDotenv({ quiet: true });

function required(name: string): string {
  const value = process.env[name];
  if (!value || value.trim() === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name];
  return value && value.trim() !== "" ? value : fallback;
}

function optionalInt(name: string, fallback: number): number {
  const value = process.env[name];
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

const nodeEnv = optional("NODE_ENV", "development");

export const env = {
  nodeEnv,
  isProduction: nodeEnv === "production",
  isTest: nodeEnv === "test",
  port: optionalInt("PORT", 4000),

  databaseUrl: required("DATABASE_URL"),

  jwt: {
    accessSecret: required("JWT_ACCESS_SECRET"),
    refreshSecret: required("JWT_REFRESH_SECRET"),
    accessTtl: optional("JWT_ACCESS_TTL", "15m"),
    refreshTtlDays: optionalInt("JWT_REFRESH_TTL_DAYS", 7),
    issuer: optional("JWT_ISSUER", "callvitals-pro"),
  },

  redis: {
    url: optional("REDIS_URL", "redis://localhost:6379"),
    enabled: optional("REDIS_ENABLED", "true") === "true",
    // Some managed Redis providers (Upstash included) require TLS even when
    // the connection string they hand out uses the plain `redis://` scheme
    // rather than `rediss://`, so this can't be reliably auto-detected from
    // the URL alone. Local/Docker Redis has no TLS at all, so this defaults
    // to off and must be opted into explicitly for those providers.
    tls: optional("REDIS_TLS", "false") === "true",
    analyticsTtlSeconds: optionalInt("CACHE_ANALYTICS_TTL_SECONDS", 60),
    callsTtlSeconds: optionalInt("CACHE_CALLS_TTL_SECONDS", 30),
  },

  cors: {
    origin: optional("CORS_ORIGIN", "http://localhost:5173"),
  },

  cookie: {
    secure:
      optional("COOKIE_SECURE", nodeEnv === "production" ? "true" : "false") === "true",
    domain: process.env.COOKIE_DOMAIN,
  },

  rateLimit: {
    windowMs: optionalInt("RATE_LIMIT_WINDOW_MS", 15 * 60 * 1000),
    max: optionalInt("RATE_LIMIT_MAX", 300),
    authMax: optionalInt("RATE_LIMIT_AUTH_MAX", 10),
  },

  bodyLimit: optional("BODY_LIMIT", "1mb"),
} as const;
