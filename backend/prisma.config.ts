import "dotenv/config";
import { defineConfig } from "prisma/config";

// Replaces the deprecated package.json#prisma config block. The datasource
// URL stays in schema.prisma's env("DATABASE_URL") since Prisma 6 still
// fully supports that; moving it here would require also declaring
// `engine: "classic"`, which isn't needed for this project.
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
