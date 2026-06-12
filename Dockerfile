# Stage 1: Build the React frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the backend API & static files
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
# Install only production dependencies
RUN npm install --only=production
COPY --from=builder /app/dist ./dist
COPY server.js schema.sql ./

ENV PORT=80
EXPOSE 80

CMD ["node", "server.js"]
