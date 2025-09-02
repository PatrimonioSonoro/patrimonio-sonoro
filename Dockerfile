## Multi-stage Dockerfile for Next.js app (Node 18, Alpine)
# Stage 1: build
FROM node:18-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production

# Install minimal tools (git used by some installs/scripts)
RUN apk add --no-cache bash git

# Copy package files and install dependencies
COPY package*.json ./
# Use npm ci when lockfile present, fallback to npm install
RUN if [ -f package-lock.json ]; then npm ci --silent; else npm install --silent; fi

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: runtime
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Add CA certs for network requests
RUN apk add --no-cache ca-certificates

# Copy build artifacts and necessary files
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run", "start"]
