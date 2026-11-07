#!/bin/sh
# Deploys images GitHub built. Run on the server:
#   /opt/pacsaz/deploy.sh               # latest build
#   /opt/pacsaz/deploy.sh <full-sha>    # a specific commit (also a rollback)
#
# Pulls the three images, applies pending Prisma migrations with the tools
# image, and only when that succeeds restarts client and admin. A failed
# migration stops here and leaves the running apps as they were.
set -eu
cd /opt/pacsaz
registry=ghcr.io/ezlegin
tag="${1:-latest}"
if [ "$tag" != latest ] && ! printf '%s' "$tag" | grep -Eqx '[0-9a-f]{40}'; then
  echo "expected a full 40-character commit sha or \"latest\"" >&2
  exit 2
fi

for name in client admin tools; do
  docker pull -q "$registry/pacsaz-$name:$tag" >/dev/null
done
# Resolve "latest" to the commit it was built from, so .env pins a real sha.
sha=$(docker image inspect "$registry/pacsaz-client:$tag" \
  --format '{{range .Config.Env}}{{println .}}{{end}}' | sed -n 's/^APP_VERSION=//p')
if [ -z "$sha" ] || [ "$sha" = dev ]; then sha="$tag"; fi
if [ "$sha" != "$tag" ]; then
  # Tag the pulled images with their sha, so the pin resolves locally.
  for name in client admin tools; do
    docker tag "$registry/pacsaz-$name:$tag" "$registry/pacsaz-$name:$sha"
  done
fi

get() { sed -n "s/^$1=//p" .env | tail -n 1; }
set_var() { sed -i "/^$1=/d" .env; echo "$1=$2" >> .env; }

echo "applying database migrations for $sha"
if ! TOOLS_TAG="$sha" docker compose run --rm -T tools; then
  echo "migration failed; nothing was restarted" >&2
  exit 1
fi

previous=$(get CLIENT_TAG)
for var in CLIENT_TAG ADMIN_TAG TOOLS_TAG; do set_var "$var" "$sha"; done
if [ -n "$previous" ] && [ "$previous" != "$sha" ] && [ "$previous" != latest ]; then
  set_var PREVIOUS_TAG "$previous"
fi

docker compose up -d --remove-orphans client admin
echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $sha" >> deploys.log

# A restart is not success: both sites must answer through the shared proxy.
# Before the certificate exists the proxy serves a self-signed one, hence -k.
smoke() {
  curl -sk -o /dev/null -w '%{http_code}' --resolve "$1:443:127.0.0.1" "https://$1$2" 2>/dev/null || true
}
ok=0; c=""; a=""
for _ in $(seq 1 45); do
  c=$(smoke pacsaz.ir /); a=$(smoke admin.pacsaz.ir /login)
  if [ "$c" = 200 ] && [ "$a" = 200 ]; then ok=1; break; fi
  sleep 2
done
if [ "$ok" != 1 ]; then
  echo "smoke check failed: pacsaz.ir/ -> ${c:-none}, admin.pacsaz.ir/login -> ${a:-none}" >&2
  docker compose ps >&2
  exit 1
fi
echo "smoke check passed"

# The disk is shared: keep only the current and previous Pacsaz images.
# Other apps' images are never touched.
keep=" $(get CLIENT_TAG) $(get PREVIOUS_TAG) "
for name in client admin tools; do
  docker images --format '{{.Tag}}' "$registry/pacsaz-$name" | while read -r t; do
    case "$keep" in
      *" $t "*) ;;
      *) docker rmi "$registry/pacsaz-$name:$t" >/dev/null 2>&1 || true ;;
    esac
  done
done
