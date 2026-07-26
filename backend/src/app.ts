import express, { type Express } from "express";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import cookieParser from "cookie-parser";
import { env } from "@/config/env";
import { httpLogger } from "@/api/middleware/httpLogger";
import { globalRateLimiter } from "@/api/middleware/rateLimiters";
import { errorHandler } from "@/api/middleware/errorHandler";
import { notFoundHandler } from "@/api/middleware/notFoundHandler";
import { router } from "@/api/routes";

export function createApp(): Express {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(
    helmet({
      contentSecurityPolicy: env.isProduction ? undefined : false,
      crossOriginResourcePolicy: { policy: "cross-origin" },
    }),
  );
  app.use(
    cors({
      origin: env.cors.origin,
      credentials: true,
      methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    }),
  );
  app.use(compression());
  app.use(express.json({ limit: env.bodyLimit }));
  app.use(express.urlencoded({ extended: true, limit: env.bodyLimit }));
  app.use(cookieParser());
  app.use(httpLogger);
  app.use(globalRateLimiter);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/api", router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
