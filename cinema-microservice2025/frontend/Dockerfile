# Stage 1: Build React app
FROM node:20-alpine AS build
WORKDIR /app

# Copy package files from frontend-fixed
COPY frontend-fixed/package*.json ./
RUN npm ci

# Copy the rest of the source code
COPY frontend-fixed .

# Ensure vite is executable
RUN chmod +x node_modules/.bin/vite

# Build the app
RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:1.25-alpine

# Copy build output to Nginx web root
COPY --from=build /app/dist /usr/share/nginx/html

# Enable SPA routing (so React Router works)
RUN sed -i 's|try_files .*;|try_files $uri /index.html;|g' /etc/nginx/conf.d/default.conf