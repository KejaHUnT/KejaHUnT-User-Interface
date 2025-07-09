#!/bin/sh                    
envsubst < template > env.js # Replaces ${VARIABLES} with actual values
nginx -g 'daemon off;'       # Starts nginx web server in foreground
