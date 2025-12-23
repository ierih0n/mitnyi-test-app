#!/bin/sh

# Substitute environment variables in the Nginx config template
envsubst '$BACKEND_URL' < /etc/nginx/conf.d/default.conf > /etc/nginx/conf.d/default.conf.tmp
mv /etc/nginx/conf.d/default.conf.tmp /etc/nginx/conf.d/default.conf

# Start Nginx
nginx -g 'daemon off;'
