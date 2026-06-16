# voto-cypress

## Overview
This repository contains the Cypress end-to-end (E2E) regression and smoke suites for the VOTO5 web application. Tests follow a Page Object Model structure and produce JUnit reports, screenshots, and videos for analysis.

## Quick Start: Running Against Your Local voto5 Docker Stack

The easiest way to run the suite is from the `voto5` repo, against your local Docker stack — no Node/npm on the host required (the suite runs inside `cypress/included`):

```bash
cd ../voto5
make up           # bring up the voto5 stack (if not already running)
make e2e-setup    # one-time: writes cypress.env.json here, disables debugbar, seeds e2e data
make e2e-smoke    # run the smoke suite
make e2e-regression
make e2e-run SPEC=cypress/e2e/smoke_test/1_subscriber_test.js   # single spec
make e2e-clean    # remove reports/screenshots (root-owned by the container)
```

Details that matter:
- **Seeded data and credentials** come from `voto5/database/seeders/CypressE2ESeeder.php` (orgs "Automated Testing Placeholder" + "HNI 321 Mali", login user, languages, voice routes, audio files, the report tree, etc.). `make e2e-seed` is idempotent and also resets the login user's active org — run it if specs were interrupted mid-suite.
- **Smoke specs are order-dependent**: `1_subscriber_test` creates the "Cypress Evaluation" contact later specs use. Run whole suites, not shuffled subsets.
- **Laravel Debugbar must be off** in voto5 (`APP_DEBUG_DEBUGBAR=0`) — its hidden inputs break the suite's generic selectors. `make e2e-setup` handles this.
- **Known local limits**: report data/exports and audience-targeting estimation require BigQuery; call-to-record requires live telephony. Those tests fail against a local stack today.

## Prerequisites
- Node.js 16+ (matches the Cypress base image)
- npm
- Docker (optional, required for the Jenkins-aligned workflow)
- `just` task runner (optional locally; the Docker image ships with it). If you do not have `just` installed, run `./scripts/run-just.sh --list` to bootstrap a local copy into `./bin`.

## Getting Started
1. Clone this repository.
2. Duplicate `example.cypress.env.json` to `cypress.env.json` and populate it with environment-specific credentials.
3. Install dependencies:
   ```bash
   just install      # preferred (validates env file)
   # or
   npm ci
   ```

> **Note:** `just install` aborts in CI if `cypress.env.json` is missing. Locally it will auto-copy the example file when present.

## Running Tests
- `just run-all` – headless run of every spec under `cypress/e2e/**`
- `just run-smoke` – only smoke specs
- `just run-regression` – only regression specs
- `npm run cy:open` – open the Cypress GUI runner
- `npm run cy:run` – headless run using npm scripts

Artifacts are written to:
- `cypress/reports/junit/` – JUnit XML
- `cypress/screenshots/` – Screenshots on failure (per spec configuration)
- `cypress/videos/` – Video recordings when enabled

## Docker & CI Workflow
The repository ships with `docker/ci/Dockerfile`, which layers on top of `cypress/included:10.7.0`, installs the `just` CLI, and expects the repository to be bind-mounted at `/e2e`.

- Build & run locally: `just docker-ci` (add `smoke` or `regression` to scope the suite)
- The container mounts the workspace, so test artifacts remain on the host.
- npm cache is mounted at `$NPM_CACHE_DIR` (defaults to `/home/jenkins/.cache/npm` in CI) to accelerate repeated installs.

## Jenkins Pipeline
The `Jenkinsfile` builds the Docker image and executes `just ci` inside it via `./scripts/run-just.sh`. Key behaviour:
- Parameter `CYPRESS_SUITE` selects `all`, `smoke`, or `regression` suites.
- Credentials expected:
  - File credential `voto-cypress-env-json` → streamed to `cypress.env.json`.
  - (Optional) Secret text `voto-cypress-record-key` → exported as `CYPRESS_RECORD_KEY` for Cypress Dashboard uploads.
- `node_modules` are cached between builds via `io.viamo.jenkins.Cache` helpers.
- Test reports and rich artifacts (screenshots/videos) are archived automatically.

## Project Structure
```
├── cypress/
│   ├── e2e/
│   │   ├── smoke_test/
│   │   └── regression_test/
│   ├── fixtures/
│   └── support/
├── docker/ci/Dockerfile
├── justfile
├── scripts/
│   ├── install.sh
│   ├── cypress-run.sh
│   ├── docker-ci.sh
│   └── run-just.sh
├── cypress.config.js
└── example.cypress.env.json
```

## Support
Questions? Contact the Automation Initiative team or the repository maintainers.
