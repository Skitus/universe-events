# === builder stage ===
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Копируем конфигурацию воркспейса и lockfile
COPY pnpm-workspace.yaml pnpm-lock.yaml ./

# 2) Копируем пакет shared, чтобы pnpm зарегистрировал его как workspace-пакет
COPY shared ./shared

# 3) Копируем package.json только для gateway
COPY gateway/package.json ./

# 4) Устанавливаем продакшен-зависимости (включая @universe/shared)
RUN corepack enable \
 && corepack prepare pnpm@10.12.3 --activate \
 && pnpm install --prod --no-frozen-lockfile

# 5) Копируем исходники gateway и собираем
COPY gateway ./
RUN pnpm run build

# === runtime stage ===
FROM node:18-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl

# 6) Копируем в рантайм: только нужные артефакты
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health/live || exit 1

CMD ["node", "dist/main.js"]
