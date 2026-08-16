# Multi-stage Dockerfile for WriteChamp (Next.js production).
#
# Stages:
#   1. dependencies — install npm packages (cached unless package files change)
#   2. builder      — compile the Next.js app (needs NEXT_PUBLIC_* keys)
#   3. runner       — tiny image that only runs the compiled server
#
# FROM    start from an existing image
# WORKDIR cd into this directory for later commands
# COPY    copy files from the build context (this repo) into the image
# RUN     execute a command at *build* time
# ARG     value passed at build time (--build-arg / Compose build.args)
# ENV     environment variable inside the image
# USER    drop root privileges
# EXPOSE  documents the port (does not publish it; Compose / docker run -p does)
# CMD     default command when the container starts

# ============================================
# Stage 1: Install dependencies
# ============================================

FROM node:24-slim AS dependencies

WORKDIR /app

# Copy only package files first. Docker caches this layer: if these files
# have not changed, it reuses the previous npm ci result instead of
# reinstalling everything on every build.
COPY package.json package-lock.json ./

# npm ci = clean, lockfile-exact install (reproducible; fails if lock is stale).
RUN npm ci

# ============================================
# Stage 2: Build Next.js in standalone mode
# ============================================

FROM node:24-slim AS builder

WORKDIR /app

COPY --from=dependencies /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* values are inlined into the client JS at *build* time.
# Passing them only at container start (docker run -e) will not work.
ARG NEXT_PUBLIC_AWS_ACCESS_KEY_ID
ARG NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY
ENV NEXT_PUBLIC_AWS_ACCESS_KEY_ID=$NEXT_PUBLIC_AWS_ACCESS_KEY_ID
ENV NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY=$NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Requires output: "standalone" in next.config.ts.
# Result: .next/standalone (server.js + traced node_modules).
RUN npm run build

# ============================================
# Stage 3: Run the compiled app
# ============================================

FROM node:24-slim AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# Listen on all interfaces so traffic from outside the container can reach us.
# 127.0.0.1 would only accept connections from inside this container.
ENV HOSTNAME=0.0.0.0

# Standalone output does not include public/ or .next/static — copy them extra.
COPY --from=builder --chown=node:node /app/public ./public

RUN mkdir .next && chown node:node .next

COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static

USER node

EXPOSE 3000

CMD ["node", "server.js"]
