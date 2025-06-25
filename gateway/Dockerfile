# gateway/Dockerfile

FROM node:18-alpine AS builder

# 1) Build stage
WORKDIR /app

# install dependencies
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
 && corepack prepare pnpm@10.12.3 --activate \
 && pnpm install --frozen-lockfile

# copy source and compile
COPY . .
RUN pnpm run build

# 2) Runtime stage
FROM node:18-alpine

WORKDIR /app

# for healthchecks
RUN apk add --no-cache curl

# copy only what's needed
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# expose port
EXPOSE 3000

# built-in healthcheck (optional, you can remove if you keep it in docker-compose)
HEALTHCHECK --interval=10s --timeout=5s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health/live || exit 1

# launch
CMD ["node", "dist/main"]
