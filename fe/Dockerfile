FROM nginx:alpine

# Install certbot for Let's Encrypt
RUN apk add --no-cache certbot openssl

# Copy your app and nginx config
COPY app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP and HTTPS
EXPOSE 80 443

# Entrypoint script to generate SSL if not exist
RUN mkdir -p /docker-entrypoint-init.d
RUN printf '#!/bin/sh\n\
if [ ! -f /etc/letsencrypt/live/www.gelarpawiwahan.site/fullchain.pem ]; then\n\
  certbot certonly --standalone -d www.gelarpawiwahan.site -d gelarpawiwahan.site --non-interactive --agree-tos -m your@email.com\n\
fi\n\
nginx -g "daemon off;"\n' > /docker-entrypoint-init.d/start.sh \
  && chmod +x /docker-entrypoint-init.d/start.sh

CMD ["/docker-entrypoint-init.d/start.sh"]
