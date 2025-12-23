# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy root package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy service package files
COPY apps/invoice-service/package*.json ./apps/invoice-service/
COPY apps/invoice-service/tsconfig.json ./apps/invoice-service/

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY apps/invoice-service/src ./apps/invoice-service/src
COPY apps/invoice-service/nest-cli.json ./apps/invoice-service/

# Build the application
WORKDIR /app/apps/invoice-service
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/apps/invoice-service/package*.json ./

# Install production dependencies only
RUN npm ci --production --workspaces=false

# Copy built application
COPY --from=builder /app/apps/invoice-service/dist ./dist

# Create uploads directory
RUN mkdir -p /app/uploads

# Expose port
EXPOSE 3002

# Start the application
CMD ["node", "dist/main.js"]
