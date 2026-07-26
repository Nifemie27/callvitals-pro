process.env.NODE_ENV = "test";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://callvitals:callvitals_dev_password@localhost:5433/callvitals_test?schema=public";
process.env.JWT_ACCESS_SECRET = "test-access-secret-do-not-use-in-production";
process.env.JWT_REFRESH_SECRET = "test-refresh-secret-do-not-use-in-production";
process.env.JWT_ACCESS_TTL = "15m";
process.env.REDIS_ENABLED = "false";
process.env.CORS_ORIGIN = "http://localhost:5173";
process.env.RATE_LIMIT_MAX = "10000";
process.env.RATE_LIMIT_AUTH_MAX = "10000";
