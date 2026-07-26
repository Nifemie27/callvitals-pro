import morgan from "morgan";
import { logger } from "@/utils/logger";
import { env } from "@/config/env";

/** Routes Morgan's access log lines through the structured JSON logger. */
export const httpLogger = morgan(env.isProduction ? "combined" : "dev", {
  stream: {
    write: (message: string): void => {
      logger.info(message.trim(), { source: "http" });
    },
  },
  skip: () => env.isTest,
});
