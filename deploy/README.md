# Deploying Pacsaz

Production runs on the shared VPS `91.107.179.58` in `/opt/pacsaz`, next to
other apps. Images are **built on GitHub Actions** and pulled from GHCR; the
server never builds.

| Host | Container | Port |
| --- | --- | --- |
| `pacsaz.ir`, `www.pacsaz.ir` | `pacsaz-client` (`apps/client`) | 3000 |
| `admin.pacsaz.ir` | `pacsaz-admin` (`apps/admin`) | 3001 |
| — | `pacsaz-db` (Postgres 18, private network only) | 5432 |

TLS and routing are the existing `nginx-proxy` + Let's Encrypt companion
containers: the apps join the external `app_network` with `VIRTUAL_HOST` /
`LETSENCRYPT_HOST`, so the proxy needs no change.

## Images

`.github/workflows/build.yml` runs on every push to `main`:

1. starts an empty Postgres service, applies the migrations to it (some pages
   read the database while `next build` prerenders them),
2. builds both apps with `output: "standalone"`,
3. pushes `ghcr.io/ezlegin/pacsaz-{client,admin,tools}` as `:<sha>` and
   `:latest`.

`tools` is a small workspace install of `@repo/db` (plus the engine packages
the seeds import) used for migrations, the first admin account and seeds.

`NEXT_PUBLIC_MAIN_URL` is inlined at build time (set in the workflow).
`GOOGLE_SITE_VERIFICATION` comes from the repository variable of that name.

## Deploying

`.github/workflows/deploy.yml` is **manual** (Actions → Deploy → Run
workflow). It SSHes as `pacsaz-deploy`, whose key may only run
`/opt/pacsaz/deploy.sh-wrapper` → `sudo /opt/pacsaz/deploy.sh <sha|latest>`:
pull the images, `prisma migrate deploy` with `tools`, then restart client and
admin and smoke-test both through the proxy. A failed migration restarts
nothing. Rollback = deploy an older sha.

Repository secrets: `DEPLOY_SSH_KEY` (private key of `pacsaz-deploy`) and
`DEPLOY_KNOWN_HOSTS` (`ssh-keyscan -t ed25519 91.107.179.58`), in a
`production` environment.

## Server layout

```
/opt/pacsaz/
  compose.yml        stack (copy of deploy/compose.yml)
  deploy.sh          pull, migrate, restart, smoke check, prune old images
  deploy.sh-wrapper  forced command of the deploy key
  backup.sh          nightly pg_dump → backups/ (14 kept)
  cron.sh            POST /api/cron?task=daily|monthly with CRON_SECRET
  .env               POSTGRES_PASSWORD, per-app AUTH_SECRETs, image tags,
                     LETSENCRYPT hosts (compose variables)
  .env.production    runtime secrets for the containers
/etc/cron.d/pacsaz   notification jobs + nightly backup → /var/log/pacsaz.log
```

## Going live

1. DNS (currently on Vercel): `pacsaz.ir`, `www.pacsaz.ir` and
   `admin.pacsaz.ir` → `A 91.107.179.58`, DNS only (no CDN proxy), so the
   HTTP-01 challenge reaches the server.
2. In `/opt/pacsaz/.env` set `CLIENT_LETSENCRYPT_HOST=pacsaz.ir,www.pacsaz.ir`
   and `ADMIN_LETSENCRYPT_HOST=admin.pacsaz.ir`.
3. Run the Deploy workflow (or `/opt/pacsaz/deploy.sh` on the server).
4. First admin and catalogue data:

   ```sh
   cd /opt/pacsaz
   docker compose run --rm tools pnpm prisma:generate-admin
   docker compose run --rm tools pnpm seed:tarrifs
   docker compose run --rm tools pnpm seed:categories
   docker compose run --rm tools pnpm seed:templates
   ```

   Then remove `ADMIN_PASSWORD` from `.env.production`.
5. Update the Zarinpal callback domain if it is registered there, and stop the
   cron-job.org trigger (the server's cron replaces it).

## Day to day

- Logs: `docker compose -f /opt/pacsaz/compose.yml logs -f client admin`
- Status: `docker compose -f /opt/pacsaz/compose.yml ps`
- Database shell: `docker compose -f /opt/pacsaz/compose.yml exec db psql -U pacsaz`
