#!/usr/bin/env bash
set -euo pipefail

SUITE="${1:-all}"
REPORTS_DIR="${REPORTS_DIR:-cypress/reports/junit}"
JUNIT_OUTPUT="${JUNIT_OUTPUT:-cypress/reports/junit/results-[hash].xml}"
DEFAULT_BASE_URL="${DEFAULT_BASE_URL:-https://staging.example.com}"

mkdir -p "${REPORTS_DIR}"
export CYPRESS_baseUrl="${CYPRESS_baseUrl:-${DEFAULT_BASE_URL}}"

case "${SUITE}" in
  smoke) SPEC='cypress/e2e/smoke_test/**/*.js' ;;
  regression) SPEC='cypress/e2e/regression_test/**/*.js' ;;
  all|'') SPEC='' ;;
  *) SPEC="${SUITE}" ;;
esac

REPORT_OPTS="mochaFile=${JUNIT_OUTPUT},toConsole=true"
CMD=(npx cypress run --browser "${CYPRESS_BROWSER:-chrome}" \
  --reporter junit --reporter-options "${REPORT_OPTS}")

if [[ -n "${SPEC}" ]]; then
  CMD+=(--spec "${SPEC}")
fi

echo -n "[cypress] Running:"
printf ' %q' "${CMD[@]}"
echo
"${CMD[@]}"
