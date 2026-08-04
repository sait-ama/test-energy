FROM node:23.11-alpine as base

ARG GIT_HASH
ARG S3_BUCKET
ARG S3_ACCESS_KEY
ARG S3_SECRET_KEY
ARG SENTRY_AUTH_TOKEN
ARG SENTRY_URL
ARG SENTRY_ORG
ARG POSTHOG_HOST
ARG POSTHOG_KEY
ARG SENTRY_PROJECT
ENV GIT_HASH=$GIT_HASH
ENV AWS_ACCESS_KEY_ID=$S3_ACCESS_KEY
ENV POSTHOG_KEY=$POSTHOG_KEY
ENV POSTHOG_HOST=$POSTHOG_HOST
ENV AWS_SECRET_ACCESS_KEY=$S3_SECRET_KEY

FROM base AS builder
RUN apk update && apk add libc6-compat
WORKDIR /app

RUN npm install -g pnpm@9.15.4

COPY . .
ENV GIT_HASH=$GIT_HASH
RUN pnpm dlx turbo telemetry disable
RUN pnpm dlx turbo prune web --docker

FROM base AS installer
RUN apk update && apk add libc6-compat python3 make g++ cairo-dev pango-dev jpeg-dev giflib-dev librsvg-dev pixman-dev
WORKDIR /app

RUN npm install -g pnpm@9.15.4

COPY --from=builder /app/out/json/ .
RUN pnpm install --no-frozen-lockfile

COPY --from=builder /app/out/full/ .
RUN pnpm dlx turbo telemetry disable
ENV GIT_HASH=$GIT_HASH
ENV CI 1
ENV SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN
ENV SENTRY_ENABLED=1
ENV SENTRY_DSN=$SENTRY_URL
ENV POSTHOG_KEY=$POSTHOG_KEY
ENV POSTHOG_HOST=$POSTHOG_HOST
ENV SENTRY_ORG=$SENTRY_ORG
ENV SENTRY_PROJECT=$SENTRY_PROJECT
RUN echo "GIT_HASH=$GIT_HASH" >> /app/apps/web/.env
RUN echo "SENTRY_AUTH_TOKEN=$SENTRY_AUTH_TOKEN" >> /app/apps/web/.env
RUN echo "SENTRY_ENABLED=1" >> /app/apps/web/.env
RUN echo "SENTRY_DSN=$SENTRY_URL" >> /app/apps/web/.env
RUN echo "SENTRY_ORG=$SENTRY_ORG" >> /app/apps/web/.env
RUN echo "SENTRY_PROJECT=$SENTRY_PROJECT" >> /app/apps/web/.env
RUN echo "POSTHOG_KEY=$POSTHOG_KEY" >> /app/apps/web/.env
RUN echo "POSTHOG_HOST=$POSTHOG_HOST" >> /app/apps/web/.env
RUN cat /app/apps/web/.env
RUN --mount=type=cache,target=/app/apps/web/.next/cache \
    pnpm dlx turbo run build

FROM base AS runner
WORKDIR /app

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/node_modules /app/apps/web/node_modules
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=installer --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

ENV NEXT_TELEMETRY_DISABLED 1
USER root

RUN apk add --no-cache --quiet curl unzip aws-cli

RUN aws --version

USER root

RUN aws configure set aws_access_key_id $S3_ACCESS_KEY
RUN aws configure set aws_secret_access_key $S3_SECRET_KEY
RUN aws configure set endpoint_url https://storage.yandexcloud.net/
RUN aws s3 cp /app/apps/web/.next/static s3://$S3_BUCKET/_static/$GIT_HASH/_next/static --recursive --endpoint-url https://storage.yandexcloud.net --quiet
RUN aws s3 cp /app/apps/web/public s3://$S3_BUCKET/_static/$GIT_HASH/_next/public --recursive --endpoint-url https://storage.yandexcloud.net --quiet
USER nextjs