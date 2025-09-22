#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
JUST_BIN="just"

if ! command -v just >/dev/null 2>&1; then
  JUST_BIN="${REPO_ROOT}/bin/just"
  if [[ ! -x "${JUST_BIN}" ]]; then
    mkdir -p "${REPO_ROOT}/bin"
    curl -sSfL https://just.systems/install.sh | bash -s -- --to "${REPO_ROOT}/bin"
  fi
  export PATH="${REPO_ROOT}/bin:${PATH}"
fi

exec "${JUST_BIN}" "$@"
