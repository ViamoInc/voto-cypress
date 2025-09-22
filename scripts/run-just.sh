#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JUST_BIN="just"

# Try to use system 'just' or bootstrap a local copy; if network is unavailable,
# fall back to a lightweight shim that supports the subset of tasks we need.
have_just() {
  command -v just >/dev/null 2>&1 || [[ -x "${REPO_ROOT}/bin/just" ]]
}

bootstrap_just() {
  if command -v just >/dev/null 2>&1; then
    JUST_BIN="just"
    return 0
  fi
  JUST_BIN="${REPO_ROOT}/bin/just"
  if [[ -x "${JUST_BIN}" ]]; then
    export PATH="${REPO_ROOT}/bin:${PATH}"
    return 0
  fi
  mkdir -p "${REPO_ROOT}/bin"
  if curl -sSfL https://just.systems/install.sh | bash -s -- --to "${REPO_ROOT}/bin"; then
    export PATH="${REPO_ROOT}/bin:${PATH}"
    return 0
  fi
  return 1
}

if bootstrap_just; then
  exec "${JUST_BIN}" "$@"
fi

# Fallback shim implementation for common targets when 'just' is unavailable.
cmd="${1:-}"
shift || true

case "${cmd}" in
  docker-build)
    CI_IMAGE="${CI_IMAGE:-voto-cypress-ci:local}"
    exec docker build --file "${REPO_ROOT}/docker/ci/Dockerfile" --tag "${CI_IMAGE}" "${REPO_ROOT}"
    ;;

  docker-ci)
    suite="${1:-all}"
    CI_IMAGE="${CI_IMAGE:-voto-cypress-ci:local}"
    DOCKER_SHM_SIZE="${DOCKER_SHM_SIZE:-2g}"
    REPORTS_DIR="${REPORTS_DIR:-cypress/reports/junit}"
    JUNIT_OUTPUT="${JUNIT_OUTPUT:-cypress/reports/junit/results-[hash].xml}"
    DEFAULT_BASE_URL="${DEFAULT_BASE_URL:-${CYPRESS_baseUrl:-https://staging.example.com}}"
    docker build --file "${REPO_ROOT}/docker/ci/Dockerfile" --tag "${CI_IMAGE}" "${REPO_ROOT}"
    CI_IMAGE="${CI_IMAGE}"     DOCKER_SHM_SIZE="${DOCKER_SHM_SIZE}"     REPORTS_DIR="${REPORTS_DIR}"     JUNIT_OUTPUT="${JUNIT_OUTPUT}"     DEFAULT_BASE_URL="${DEFAULT_BASE_URL}"       exec bash "${REPO_ROOT}/scripts/docker-ci.sh" "${suite}"
    ;;

  ci)
    # Minimal local CI: install + verify + run all
    "${REPO_ROOT}/scripts/install.sh"
    npx cypress verify
    exec "${REPO_ROOT}/scripts/cypress-run.sh" all
    ;;

  *)
    echo "[run-just] 'just' not available and bootstrap failed."
    echo "Supported shim targets: docker-build | docker-ci [suite] | ci"
    echo "Example: $0 docker-ci smoke"
    exit 127
    ;;
esac
