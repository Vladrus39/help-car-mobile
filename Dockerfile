# --- Stage 1: Build ---
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . ./

# Build-time variables for Vite
ARG VITE_API_URL=https://help-car.online/api/v1
ARG VITE_WS_URL=wss://help-car.online
ENV VITE_API_BASE_URL=${VITE_API_URL}
ENV VITE_WS_URL=${VITE_WS_URL}
ENV VITE_NODE_ENV=production

# Copy production env file
COPY .env.production .env.production

RUN npm run build

# --- Stage 2: Nginx ---
FROM nginx:alpine
LABEL maintainer="Help-Car"

COPY --from=builder /app/dist /usr/share/nginx/html
# nginx.conf будет монтироваться через volume в docker-compose.production.yml
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Устанавливаем правильные права доступа для nginx
# Сначала устанавливаем права на директории, затем на файлы
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chmod -R 755 /usr/share/nginx/html && \
    find /usr/share/nginx/html -type f -exec chmod 644 {} \; && \
    find /usr/share/nginx/html -type d -exec chmod 755 {} \;

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD wget -q -O - http://localhost || exit 1

CMD ["nginx", "-g", "daemon off;"]


