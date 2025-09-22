#!/usr/bin/env bash
set -euo pipefail

LOCKFILE="package-lock.json"
if [[ ! -f "${LOCKFILE}" ]]; then
  echo "[install] Missing ${LOCKFILE}" >&2
  exit 1
fi

HASH="$(sha1sum "${LOCKFILE}" | awk '{print $1}')"
MARKER_PATH="node_modules/.npm-built-from-${HASH}"

if [[ -d node_modules && -f "${MARKER_PATH}" ]]; then
  echo "[install] node_modules present and matches lockfile hash; skipping npm ci"
  exit 0
fi

npm ci --no-progress --prefer-offline \
  --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
npm rebuild --loglevel=warn || true
npm run postinstall --if-present --loglevel=warn || true
find node_modules -maxdepth 1 -type f -name '.npm-built-from-*' -delete || true
mkdir -p node_modules
: >"${MARKER_PATH}"
