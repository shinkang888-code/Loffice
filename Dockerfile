FROM node:22-bookworm-slim

RUN apt-get update \
  && apt-get install -y \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    libreoffice-draw \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY engine ./engine

ENV NODE_ENV=production
ENV LIBREOFFICE_PATH=/usr/bin/soffice
ENV PORT=10000

EXPOSE 10000

CMD ["node", "engine/server.mjs"]
