FROM node:22-bookworm-slim AS build

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable && corepack prepare pnpm@10.18.2 --activate

WORKDIR /app

COPY . .

RUN pnpm install --frozen-lockfile --config.dangerouslyAllowAllBuilds=true
RUN pnpm build

FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y --no-install-recommends ca-certificates \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV NODE_ENV=production
ENV HOST=127.0.0.1
ENV PORT=3000

COPY --from=build /app/.output ./.output

CMD ["node", "--max-old-space-size=768", "--dns-result-order=ipv4first", "--no-network-family-autoselection", ".output/server/index.mjs"]
