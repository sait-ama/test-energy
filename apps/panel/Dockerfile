FROM node:23.11-alpine AS base
RUN apk update && apk add libc6-compat
WORKDIR /app
RUN npm install -g pnpm@latest

# --- Stage 2: Builder ---
FROM base AS builder
COPY . .
RUN pnpm dlx turbo telemetry disable
RUN pnpm dlx turbo prune web --docker

WORKDIR /app/apps/panel
RUN pnpm install --frozen-lockfile
RUN pnpm vite build

# --- Stage 3: Nginx ---
FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*

# Копируем билд Vite в Nginx
COPY --from=builder /app/apps/panel/dist /usr/share/nginx/html

# Создаем конфиг прямо в Dockerfile
RUN echo 'server { \
    listen 5252; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
    error_page 500 502 503 504 /50x.html; \
    location = /50x.html { root /usr/share/nginx/html; } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 5252
CMD ["nginx", "-g", "daemon off;"]
