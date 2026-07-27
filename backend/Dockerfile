# CallVitals Pro backend. Multi-stage build so the final runtime image
# carries only production dependencies and compiled JS, not the TypeScript
# toolchain or dev dependencies used to build it.

FROM node:24-alpine AS base
RUN apk add --no-cache openssl
WORKDIR /app

# ---- deps: full install (incl. devDependencies) for building ----
FROM base AS deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci

# ---- build: compile TypeScript to dist/, resolving @/ path aliases ----
FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- prod-deps: production-only install (prisma generate runs here too) ----
FROM base AS prod-deps
COPY package.json package-lock.json prisma.config.ts ./
COPY prisma ./prisma
RUN npm ci --omit=dev

# ---- runtime: the image that actually ships ----
FROM base AS runtime
ENV NODE_ENV=production
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
COPY package.json ./
# The compiled server runs from dist/, but `prisma db seed` runs seed.ts
# directly via tsx (see prisma.config.ts's `migrations.seed`), and that
# script imports a small helper from src/utils, so src/ needs to be present
# too.
COPY --from=build /app/src ./src
COPY --from=build /app/tsconfig.json ./tsconfig.json

USER appuser
EXPOSE 4000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "require('http').get('http://localhost:4000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1)).on('error', () => process.exit(1))"

# Migrations and seeding are idempotent (migrate deploy only applies pending
# migrations; the seed script skips call records that already exist and
# upserts users by email), so running both on every boot is safe. This lets
# a single-service host like Render provision the database automatically,
# without needing a separate one-shot job the way docker-compose's
# dedicated migrate/seed services provide locally.
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma db seed && node dist/server.js"]
