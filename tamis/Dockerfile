# Use the official Bun image as the base image
FROM oven/bun:1 AS base

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Copy prisma schema first (needed for postinstall script)
COPY prisma ./prisma

# Install dependencies (remove --frozen-lockfile for Docker builds)
RUN bun install

# Install tsx globally for seed script
RUN bun add -g tsx

# Copy the rest of the application code
COPY . .

# Build the Next.js application
ENV SKIP_ENV_VALIDATION=true
RUN bun run build

# Production stage
FROM oven/bun:1-slim AS production

# Install OpenSSL and Node.js for Prisma and tsx
RUN apt-get update -y && apt-get install -y openssl nodejs npm && rm -rf /var/lib/apt/lists/*

# Set the working directory
WORKDIR /app

# Create a non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Install tsx globally for seed command
RUN npm install -g tsx

# Copy the built application from the build stage
COPY --from=base /app/public ./public
COPY --from=base --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=base --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=base /app/prisma ./prisma
COPY --from=base /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=base /app/node_modules ./node_modules
COPY --from=base /app/src ./src

# Switch to the non-root user
USER nextjs

# Expose the port the app runs on
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NEXT_PUBLIC_API_SERVER_URL="http://localhost:7887/api"
ENV JWT_SECRET="tamis-super-secret-jwt-key-2025-change-in-production"
ENV DATABASE_URL="postgresql://tamis_user:tamis_password@postgres:5432/tamis"

# Start the application
CMD ["node", "server.js"]
