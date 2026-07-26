import { env } from "@/config/env";

type LogLevel = "debug" | "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const minLevel: LogLevel = env.isProduction ? "info" : "debug";

function write(level: LogLevel, message: string, meta?: LogMeta): void {
  if (LEVEL_WEIGHT[level] < LEVEL_WEIGHT[minLevel]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...meta,
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else {
    console.log(line);
  }
}

/** Structured JSON logger. One line per event, safe to ship to any log aggregator. */
export const logger = {
  debug: (message: string, meta?: LogMeta): void => write("debug", message, meta),
  info: (message: string, meta?: LogMeta): void => write("info", message, meta),
  warn: (message: string, meta?: LogMeta): void => write("warn", message, meta),
  error: (message: string, meta?: LogMeta): void => write("error", message, meta),
};
