#!/usr/bin/env bash
set -euo pipefail

ROOT=/var/www/plankbevelen-blog
COMPOSE=(docker compose -f "$ROOT/docker/docker-compose.yml")

cd "$ROOT"

git fetch origin main
git checkout -B main origin/main

SHA=$(git rev-parse --short HEAD)

docker build -f docker/Dockerfile -t "plankbevelen-blog:${SHA}" .

install -d -o www-data -g www-data -m 755 /var/cache/nginx/plankbevelen
install -m 644 deploy/nginx/plankbevelen-http.conf /etc/nginx/conf.d/plankbevelen-http.conf
install -D -m 644 deploy/nginx/snippets/security-headers.conf /etc/nginx/snippets/plankbevelen-security.conf
install -m 644 deploy/nginx/plankbevelen-blog.conf /etc/nginx/sites-available/plankbevelen-blog.conf
nginx -t
systemctl reload nginx

had_current=0
if docker image inspect plankbevelen-blog:current >/dev/null 2>&1; then
  had_current=1
  docker tag plankbevelen-blog:current plankbevelen-blog:previous
fi
docker tag "plankbevelen-blog:${SHA}" plankbevelen-blog:current

export IMAGE_TAG=current
if ! "${COMPOSE[@]}" up -d --wait --no-build; then
  "${COMPOSE[@]}" down || true
  if [ "$had_current" -eq 1 ]; then
    docker tag plankbevelen-blog:previous plankbevelen-blog:current
    "${COMPOSE[@]}" up -d --wait --no-build
  else
    docker rmi plankbevelen-blog:current || true
  fi
  echo "容器启动失败" >&2
  exit 1
fi

docker images plankbevelen-blog --format '{{.Tag}}' | while read -r tag; do
  case "$tag" in
    current|previous|"$SHA"|"<none>") ;;
    *) docker rmi "plankbevelen-blog:${tag}" || true ;;
  esac
done
docker image prune -f >/dev/null || true
