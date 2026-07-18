#!/usr/bin/env bash
set -euo pipefail

: "${APP_NAME:?APP_NAME is required}"
: "${DEPLOY_ENV:?DEPLOY_ENV is required}"
: "${HEALTH_URL:?HEALTH_URL is required}"
: "${RELEASE_ID:?RELEASE_ID is required}"
: "${REMOTE_BASE:?REMOTE_BASE is required}"
: "${SERVER_HOST:?SERVER_HOST is required}"
: "${SERVER_USER:?SERVER_USER is required}"

case "$DEPLOY_ENV" in
  prod)
    APP_PM2_NAME="${APP_NAME}-prod"
    ;;
  test)
    APP_PM2_NAME="${APP_NAME}-test"
    ;;
  *)
    echo "Unsupported DEPLOY_ENV: $DEPLOY_ENV" >&2
    exit 1
    ;;
esac

if [[ ! -f release.tar.gz ]]; then
  echo "release.tar.gz not found. Run the Package stage first." >&2
  exit 1
fi

SSH_TARGET="${SERVER_USER}@${SERVER_HOST}"
SSH_OPTS=(-o StrictHostKeyChecking=accept-new)
REMOTE_TMP="/tmp/${APP_NAME}-${DEPLOY_ENV}-${RELEASE_ID}.tar.gz"

ssh "${SSH_OPTS[@]}" "$SSH_TARGET" "mkdir -p '${REMOTE_BASE}/${DEPLOY_ENV}/releases' '${REMOTE_BASE}/${DEPLOY_ENV}/shared/uploads' '${REMOTE_BASE}/${DEPLOY_ENV}/logs'"
scp "${SSH_OPTS[@]}" release.tar.gz "${SSH_TARGET}:${REMOTE_TMP}"

ssh "${SSH_OPTS[@]}" "$SSH_TARGET" \
  "APP_NAME='${APP_NAME}' DEPLOY_ENV='${DEPLOY_ENV}' REMOTE_BASE='${REMOTE_BASE}' RELEASE_ID='${RELEASE_ID}' APP_PM2_NAME='${APP_PM2_NAME}' REMOTE_TMP='${REMOTE_TMP}' bash -s" <<'REMOTE_DEPLOY'
set -euo pipefail

APP_DIR="${REMOTE_BASE}/${DEPLOY_ENV}"
RELEASES_DIR="${APP_DIR}/releases"
RELEASE_DIR="${RELEASES_DIR}/${RELEASE_ID}"
ENV_FILE="${APP_DIR}/shared/.env"
CURRENT_LINK="${APP_DIR}/current"
PREVIOUS_FILE="${APP_DIR}/previous_release"

case "$RELEASE_DIR" in
  "$RELEASES_DIR"/*) ;;
  *)
    echo "Refusing unsafe release path: $RELEASE_DIR" >&2
    exit 1
    ;;
esac

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing environment file: $ENV_FILE" >&2
  echo "Create it from the matching .env.*.example template before deploying." >&2
  exit 1
fi

PREVIOUS_CURRENT=""
if [[ -L "$CURRENT_LINK" ]]; then
  PREVIOUS_CURRENT="$(readlink -f "$CURRENT_LINK" || true)"
fi

rm -rf "$RELEASE_DIR"
mkdir -p "$RELEASE_DIR" "${APP_DIR}/shared/uploads" "${APP_DIR}/logs"
tar -xzf "$REMOTE_TMP" -C "$RELEASE_DIR"
rm -f "$REMOTE_TMP"

ln -sfn "$ENV_FILE" "${RELEASE_DIR}/.env"
ln -sfn "$RELEASE_DIR" "${CURRENT_LINK}.new"
mv -Tf "${CURRENT_LINK}.new" "$CURRENT_LINK"

if [[ -n "$PREVIOUS_CURRENT" ]]; then
  printf '%s\n' "$PREVIOUS_CURRENT" > "$PREVIOUS_FILE"
fi

cd "$CURRENT_LINK"
pm2 startOrReload ecosystem.config.cjs --only "$APP_PM2_NAME" --update-env
pm2 save
REMOTE_DEPLOY

sleep 3
if ! curl --fail --silent --show-error --retry 6 --retry-delay 2 "$HEALTH_URL" >/dev/null; then
  echo "Health check failed for $HEALTH_URL, rolling back $DEPLOY_ENV." >&2
  ssh "${SSH_OPTS[@]}" "$SSH_TARGET" \
    "DEPLOY_ENV='${DEPLOY_ENV}' REMOTE_BASE='${REMOTE_BASE}' APP_PM2_NAME='${APP_PM2_NAME}' bash -s" <<'REMOTE_ROLLBACK'
set -euo pipefail

APP_DIR="${REMOTE_BASE}/${DEPLOY_ENV}"
CURRENT_LINK="${APP_DIR}/current"
PREVIOUS_FILE="${APP_DIR}/previous_release"

if [[ ! -f "$PREVIOUS_FILE" ]]; then
  echo "No previous release recorded; rollback cannot continue." >&2
  exit 1
fi

PREVIOUS_RELEASE="$(cat "$PREVIOUS_FILE")"
if [[ ! -d "$PREVIOUS_RELEASE" ]]; then
  echo "Previous release does not exist: $PREVIOUS_RELEASE" >&2
  exit 1
fi

ln -sfn "$PREVIOUS_RELEASE" "${CURRENT_LINK}.rollback"
mv -Tf "${CURRENT_LINK}.rollback" "$CURRENT_LINK"
cd "$CURRENT_LINK"
pm2 startOrReload ecosystem.config.cjs --only "$APP_PM2_NAME" --update-env
pm2 save
REMOTE_ROLLBACK
  exit 1
fi

ssh "${SSH_OPTS[@]}" "$SSH_TARGET" \
  "DEPLOY_ENV='${DEPLOY_ENV}' REMOTE_BASE='${REMOTE_BASE}' bash -s" <<'REMOTE_CLEANUP'
set -euo pipefail

APP_DIR="${REMOTE_BASE}/${DEPLOY_ENV}"
RELEASES_DIR="${APP_DIR}/releases"

mapfile -t OLD_RELEASES < <(find "$RELEASES_DIR" -mindepth 1 -maxdepth 1 -type d -printf '%T@ %p\n' | sort -rn | awk 'NR > 3 { print $2 }')
for release in "${OLD_RELEASES[@]}"; do
  case "$release" in
    "$RELEASES_DIR"/*) rm -rf "$release" ;;
    *) echo "Skipping unsafe cleanup path: $release" >&2 ;;
  esac
done
REMOTE_CLEANUP

echo "Deployed ${APP_NAME} ${DEPLOY_ENV} release ${RELEASE_ID}."
