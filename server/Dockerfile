# Use Node.js LTS version as base
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY pnpm-lock.yaml ./

# Install dependencies
RUN npm i -g pnpm

RUN pnpm install

# Copy source code
COPY . .

# Build TypeScript
RUN pnpm build

# Expose default port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]