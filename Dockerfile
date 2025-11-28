# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Copy all source files first (quasar prepare needs the full project structure)
COPY . .

# Install dependencies (this will run quasar prepare via postinstall)
RUN npm ci

# Build the application for production
RUN npm run build

# Production stage
FROM nginx:alpine
WORKDIR /usr/share/nginx/html

# Copy built files from build stage
COPY --from=build /app/dist/spa .

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
