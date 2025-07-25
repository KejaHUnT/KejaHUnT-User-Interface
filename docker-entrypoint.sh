#!/bin/sh
envsubst < /usr/share/nginx/html/assets/env.template.js > /usr/share/nginx/html/assets/env-v2.js
nginx -g 'daemon off;'