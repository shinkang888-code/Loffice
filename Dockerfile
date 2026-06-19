FROM node:22-bookworm-slim

ENV LANG=ko_KR.UTF-8
ENV LC_ALL=ko_KR.UTF-8

RUN apt-get update \
  && apt-get install -y \
    libreoffice-writer \
    libreoffice-calc \
    libreoffice-impress \
    libreoffice-draw \
    libreoffice-l10n-ko \
    fonts-nanum \
    fonts-noto-cjk \
    --no-install-recommends \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev --ignore-scripts

COPY engine ./engine

ENV NODE_ENV=production
ENV LIBREOFFICE_PATH=/usr/bin/soffice
ENV PORT=10000

EXPOSE 10000

CMD ["node", "engine/server.mjs"]
