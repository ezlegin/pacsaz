#!/bin/sh
# Nightly database dump (see deploy/crontab): /opt/pacsaz/backups, last 14 kept.
# Copy dumps off the server too; they hold customer and payment records.
set -eu
cd /opt/pacsaz
mkdir -p backups
chmod 700 backups
file="pacsaz-$(date -u +%Y%m%d-%H%M).sql.gz"
docker compose exec -T db pg_dump -U pacsaz -d pacsaz --no-owner | gzip > "backups/$file.tmp"
mv "backups/$file.tmp" "backups/$file"
chmod 600 "backups/$file"
ls -1t backups/pacsaz-*.sql.gz | tail -n +15 | xargs -r rm --
