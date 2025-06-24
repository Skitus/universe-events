FROM node:18-alpine

WORKDIR /app

COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
 && corepack prepare pnpm@10.12.3 --activate \
 && pnpm install --prod --frozen-lockfile

COPY . .

RUN pnpm run build

CMD ["node", "dist/main"]
