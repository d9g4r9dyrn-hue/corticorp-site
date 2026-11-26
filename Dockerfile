# corticorp.com on Railway: the site's static files served by Caddy.
# Files that are not part of the site (source, notes, build config) are kept out by .dockerignore.
FROM caddy:2.8.4-alpine
COPY . /srv
RUN mv /srv/Caddyfile /etc/caddy/Caddyfile
