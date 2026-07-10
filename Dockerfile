# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /app

# Install build dependencies
COPY package*.json ./
RUN npm ci

# Copy application files
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build frontend and compile backend
RUN npm run build

# Stage 2: Runtime image
FROM node:20-alpine

WORKDIR /app

# Copy package descriptors and prisma schema
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only and generate prisma client
RUN npm ci --omit=dev && npx prisma generate

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose port 3000
EXPOSE 3000

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Start the application
CMD ["npm", "start"]
