#!/usr/bin/env bash
set -euo pipefail

ROOT=/var/www/plankbevelen-blog
COMPOSE=(docker compose -f "$ROOT/docker/docker-compose.yml")

cd "$ROOT"

if ! docker image inspect plankbevelen-blog:previous >/dev/null 2>&1; then
  echo "没有 previous 镜像，无法回滚" >&2
  exit 1
fi

docker tag plankbevelen-blog:current plankbevelen-blog:rollback-tmp
docker tag plankbevelen-blog:previous plankbevelen-blog:current
docker tag plankbevelen-blog:rollback-tmp plankbevelen-blog:previous
docker rmi plankbevelen-blog:rollback-tmp >/dev/null

export IMAGE_TAG=current
"${COMPOSE[@]}" up -d --wait --no-build
