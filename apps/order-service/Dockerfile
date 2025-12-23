# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy service package files
COPY apps/order-service/package*.json ./apps/order-service/
COPY apps/order-service/tsconfig.json ./apps/order-service/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY apps/order-service/src ./apps/order-service/src
COPY apps/order-service/nest-cli.json ./apps/order-service/

# Build the application
WORKDIR /app/apps/order-service
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/order-service/package*.json ./

# Install production dependencies only
RUN npm ci --production --workspaces=false

# Copy built application
COPY --from=builder /app/apps/order-service/dist ./dist

# Expose port
EXPOSE 3001

# Start the application
CMD ["node", "dist/main.js"]
