# =========================
# Build stage
# =========================
FROM node:20-alpine AS builder

# Create app directory
WORKDIR /app

# Copy dependency files first (better caching)
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install all dependencies (including dev deps)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript application
RUN npm run build


# =========================
# Production stage
# =========================
FROM node:20-alpine AS production

# Install CA certs + OpenSSL 3 runtime (required by Prisma)
RUN apk add --no-cache \
    ca-certificates \
    libssl3 \
    libcrypto3

# Create app directory
WORKDIR /app

# Copy only what we need for production
COPY package.json package-lock.json ./
COPY prisma ./prisma

# Install only production dependencies
RUN npm ci --omit=dev --ignore-scripts && \
    npx prisma generate

# Copy built output from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/generated ./generated

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# App port
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:5000/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# Start app
CMD ["npm", "start"]
