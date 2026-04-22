# Use Node 22 as it supports TypeScript natively
FROM node:22-slim AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies for build
RUN npm install

# Copy source
COPY . .

# Build the frontend
RUN npm run build

# --- Production Image ---
FROM node:22-slim

WORKDIR /app

# Set production environment
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --omit=dev

# Copy the built assets from builder
COPY --from=builder /app/dist ./dist
# Copy the server file
COPY --from=builder /app/server.ts ./server.ts

# Cloud Run defaults to port 8080 or uses $PORT
# We'll listen on 3000 as defined in our app, or override via env
EXPOSE 3000

# Start the server
CMD ["node", "--experimental-strip-types", "server.ts"]
