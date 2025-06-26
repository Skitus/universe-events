# === builder stage ===
FROM node:18-alpine AS builder
WORKDIR /app

# Устанавливаем pnpm
RUN npm install -g pnpm@10.12.3

# Копируем весь проект в контейнер
COPY . .

# Активируем Corepack и устанавливаем нужную версию pnpm
RUN pnpm install --frozen-lockfile --no-optional --silent --yes

# Параметр для указания, какой сервис собирать
ARG SERVICE_DIR

# Перейти в директорию нужного сервиса
WORKDIR /app/$SERVICE_DIR

# Генерируем Prisma клиента для нужного сервиса
RUN pnpm prisma generate --schema=../shared/prisma/schema.prisma

# Сборка TypeScript
RUN pnpm run build

# === runtime stage ===
FROM node:18-alpine AS runner
WORKDIR /app

# Устанавливаем curl для проверки здоровья
RUN apk add --no-cache curl

# Копируем только нужные артефакты
COPY --from=builder /app/$SERVICE_DIR/package.json ./package.json
COPY --from=builder /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/$SERVICE_DIR/dist ./dist

EXPOSE 3000
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health/live || exit 1

CMD ["pnpm", "start:prod"]
