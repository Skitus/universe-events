# === builder stage ===
FROM node:18-alpine AS builder
WORKDIR /app

# 1) Скопировать ВСЁ из репо – workspace-файлы, shared, fb-collector и т. д.
COPY . .

# 2) Активировать Corepack и установить ровно те версии, что в lockfile
RUN corepack enable \
 && corepack prepare pnpm@10.12.3 --activate \
 && pnpm install --frozen-lockfile

# 3) Перейти в каталог сервиса
WORKDIR /app/fb-collector

# 4) Сгенерировать клиента Prisma
RUN pnpm prisma generate --schema=prisma/schema.prisma

# 5) Сборка TypeScript
RUN pnpm run build

# === runtime stage ===
FROM node:18-alpine AS runner
WORKDIR /app
RUN apk add --no-cache curl

# 6) Копируем только нужные артефакты
COPY --from=builder /app/fb-collector/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/fb-collector/dist ./dist

EXPOSE 3002
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health/live || exit 1

CMD ["pnpm", "start:prod"]
