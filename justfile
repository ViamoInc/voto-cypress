set shell := ["bash", "-euo", "pipefail", "-c"]

ci_image := env_var_or_default('CI_IMAGE', 'voto-cypress-ci:local')
reports_dir := 'cypress/reports/junit'
junit_output := 'cypress/reports/junit/results-[hash].xml'
default_base_url := env_var_or_default('CYPRESS_baseUrl', 'https://staging.example.com')
shm_size := env_var_or_default('DOCKER_SHM_SIZE', '2g')

@default:
	just --list

prepare-env:
	if [ ! -f cypress.env.json ]; then \
	  if [ "${CI:-0}" = "1" ]; then \
	    echo "[prepare-env] Missing cypress.env.json in CI context" >&2; \
	    exit 1; \
	  fi; \
	  if [ -f example.cypress.env.json ]; then \
	    cp example.cypress.env.json cypress.env.json; \
	    echo "[prepare-env] Copied example.cypress.env.json -> cypress.env.json"; \
	  else \
	    echo "[prepare-env] Missing example.cypress.env.json" >&2; \
	    exit 1; \
	  fi; \
	fi

install:
	just prepare-env
	./scripts/install.sh

verify:
	npx cypress verify

cypress-run suite='all':
	REPORTS_DIR={{reports_dir}} \
	JUNIT_OUTPUT={{junit_output}} \
	DEFAULT_BASE_URL={{default_base_url}} \
	./scripts/cypress-run.sh {{suite}}

run-smoke:
	just cypress-run smoke

run-regression:
	just cypress-run regression

run-all:
	just cypress-run all

ci suite='all':
	just install
	just verify
	just cypress-run {{suite}}

docker-build:
	SAFE_DOCKER_CONFIG="${SAFE_DOCKER_CONFIG:-.docker-nocreds}"; \
	mkdir -p "$SAFE_DOCKER_CONFIG"; \
	DOCKER_BUILDKIT="${DOCKER_BUILDKIT:-0}" DOCKER_CONFIG="$SAFE_DOCKER_CONFIG" docker build --file docker/ci/Dockerfile --tag {{ci_image}} .

docker-ci suite='all':
	just docker-build
	CI_IMAGE={{ci_image}} \
	DOCKER_SHM_SIZE={{shm_size}} \
	REPORTS_DIR={{reports_dir}} \
	JUNIT_OUTPUT={{junit_output}} \
	DEFAULT_BASE_URL={{default_base_url}} \
	./scripts/docker-ci.sh {{suite}}
