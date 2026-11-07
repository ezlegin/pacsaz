#!/bin/sh
# Triggers POST /api/cron?task=<daily|monthly> on the client through the local
# proxy. Replaces the external cron-job.org trigger; every task is idempotent.
# The secret is read from .env.production so it never sits in the crontab.
set -eu
case "${1:-}" in daily | monthly) ;; *) echo "usage: cron.sh daily|monthly" >&2; exit 2 ;; esac
secret=$(sed -n 's/^CRON_SECRET=//p' /opt/pacsaz/.env.production | tail -n 1)
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) cron $1"
curl -sS --max-time 300 -X POST -H "Authorization: Bearer $secret" \
  --resolve pacsaz.ir:443:127.0.0.1 "https://pacsaz.ir/api/cron?task=$1"
echo
