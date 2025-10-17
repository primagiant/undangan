FROM nginx:alpine

# Copy app dan konfigurasi nginx
COPY app /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Sertifikat dari host akan di-mount ke container
EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
