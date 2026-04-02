#!/usr/bin/env bash
set -euo pipefail

APP_DIR="${APP_DIR:-/opt/numerical-method-web-app}"
BRANCH="${BRANCH:-main}"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Application directory $APP_DIR is not a git repository."
  exit 1
fi

cd "$APP_DIR"
git fetch origin
git checkout "$BRANCH"
git pull origin "$BRANCH"
docker compose down
docker compose up -d --build

