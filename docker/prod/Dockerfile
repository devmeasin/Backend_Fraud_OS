# syntax=docker/dockerfile:1
ARG NODE_VERSION=21.7.1

# Build Stage
FROM node:${NODE_VERSION}-alpine as builder

WORKDIR /home/node/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Update npm to the latest version and install dependencies
RUN npm install -g npm@latest && npm ci

# Copy all source files and build the application
COPY . .
RUN npm run build

# Final Stage
FROM node:${NODE_VERSION}-alpine as runner

WORKDIR /home/node/app

ENV NODE_ENV=production

# Copy production dependencies from the builder stage
COPY --from=builder /home/node/app/node_modules ./node_modules

# Copy the build output from the builder stage
COPY --from=builder /home/node/app/dist ./

# Copy additional files
COPY --from=builder /home/node/app/certs /home/node/certs
COPY --from=builder /home/node/app/.env.production /home/node/.env.production

# Ensure the 'logs' directory exists and has appropriate permissions
RUN mkdir -p /home/node/app/logs && chown -R node:node /home/node/app/logs

# Install PM2 globally
RUN npm install -g pm2@latest

USER node

EXPOSE 5001

# Start the application using PM2 with the configuration file
CMD ["pm2-runtime", "start", "server.js", "--name", "ecommosapp", "-i", "max", "--max-memory-restart", "300M"]

# CMD [ "node", "server.js" ]
