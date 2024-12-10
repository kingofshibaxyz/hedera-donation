# Worker Dockerfile
FROM node:18-alpine

WORKDIR /app

# Ensure proper environment setup
ENV NODE_ENV=production

# Install dependencies
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy application code
COPY . .

# Expose port (if applicable) and set default command
CMD ["npx", "hardhat", "run", "worker/main.ts"]
