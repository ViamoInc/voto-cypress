#!/usr/bin/env bash
set -euo pipefail

SUITE="${1:-all}"
CI_IMAGE="${CI_IMAGE:-voto-cypress-ci:local}"
SHM_SIZE="${DOCKER_SHM_SIZE:-2g}"
CACHE_DIR="${NPM_CACHE_DIR:-$HOME/.cache/npm}"
DEFAULT_BASE_URL="${DEFAULT_BASE_URL:-https://staging.example.com}"

mkdir -p "${CACHE_DIR}"
USER_ID="${UID:-$(id -u)}"
GROUP_ID="${GID:-$(id -g)}"

EXTRA_ENV=()
if [[ -n "${CYPRESS_RECORD_KEY:-}" ]]; then
  EXTRA_ENV+=("-e" "CYPRESS_RECORD_KEY=${CYPRESS_RECORD_KEY}")
fi
if [[ -n "${CYPRESS_PROJECT_ID:-}" ]]; then
  EXTRA_ENV+=("-e" "CYPRESS_PROJECT_ID=${CYPRESS_PROJECT_ID}")
fi

# Compose docker run arguments
RUN_ARGS=(
  --rm
  --shm-size "${SHM_SIZE}"
  --user "${USER_ID}:${GROUP_ID}"
  -e HOME=/tmp
  -e NPM_CONFIG_CACHE=/tmp/npm-cache
  -e DEFAULT_BASE_URL="${DEFAULT_BASE_URL}"
  -e REPORTS_DIR="${REPORTS_DIR:-cypress/reports/junit}"
  -e JUNIT_OUTPUT="${JUNIT_OUTPUT:-cypress/reports/junit/results-[hash].xml}"
  -e DOCKER_SHM_SIZE="${SHM_SIZE}"
  -e CYPRESS_baseUrl="${CYPRESS_baseUrl:-${DEFAULT_BASE_URL}}"
  -v "${PWD}:/e2e"
  -v "${CACHE_DIR}:/tmp/npm-cache"
)

# Append optional envs only if defined (works with set -u)
if ((${#EXTRA_ENV[@]:-0})); then
  RUN_ARGS+=("${EXTRA_ENV[@]}")
fi

# Execute
exec docker run "${RUN_ARGS[@]}" "${CI_IMAGE}" ci "${SUITE}"
