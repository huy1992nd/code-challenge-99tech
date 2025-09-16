# Multi-stage build for Problem 5 (Express + TS + Prisma)

FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=optional --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Generate Prisma client and build TypeScript
RUN npm run prisma:generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Copy only runtime essentials
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expose app port
EXPOSE 3000

# Optional: run migrations on start (uncomment if desired)
# RUN npm pkg set scripts.migrate:deploy="prisma migrate deploy"
# CMD ["sh", "-c", "npm run migrate:deploy && node dist/server.js"]

CMD ["node", "dist/server.js"]


