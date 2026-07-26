# CallVitals Pro frontend. Built as static assets, then served by nginx,
# which also reverse-proxies /api to the backend container so the SPA can
# call a same-origin relative path in production (see nginx.conf).

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .

# Baked in at build time: relative path, resolved by nginx's /api proxy.
ENV VITE_API_BASE_URL=/api
RUN npm run build

FROM nginx:1.27-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# 127.0.0.1, not localhost: this container's /etc/hosts resolves "localhost"
# to the IPv6 loopback first, and nginx only listens on 0.0.0.0 (IPv4), so
# wget-via-localhost gets a spurious connection-refused on every check.
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
