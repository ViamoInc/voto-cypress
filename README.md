# voto-cypress

## Overview
This repository contains the Cypress end-to-end (E2E) regression and smoke suites for the VOTO5 web application. Tests follow a Page Object Model structure and produce JUnit reports, screenshots, and videos for analysis.

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
- `just run-podcast` – only the podcast browser specs
- `just run-podcast-processing` – the opt-in podcast processing specs (see below)
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
  - File credential `voto_cypress_env_json` → streamed to `cypress.env.json`
    (must include `podcastFeedBaseUrl` for the podcast specs).
  - (Optional) Secret text `voto_cypress_record_key` → exported as `CYPRESS_RECORD_KEY` for Cypress Dashboard uploads.
- `node_modules` are cached between builds via `io.viamo.jenkins.Cache` helpers.
- Test reports and rich artifacts (screenshots/videos) are archived automatically.

## Project Structure
```
├── cypress/
│   ├── e2e/
│   │   ├── smoke_test/
│   │   ├── regression_test/
│   │   └── podcast_processing/   # opt-in, needs a queue worker + ffmpeg
│   ├── fixtures/
│   │   └── feeds/                # RSS fixtures for the podcast specs
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

## Podcast specs

`cypress/e2e/regression_test/podcast_regression_test.js` covers Content →
Podcasts (VAI-1680) and runs in the daily regression job. It touches nothing
asynchronous, so it is deterministic.

It will fail until `ENABLE_PODCASTS` is enabled for the test org — deliberately.
The spec checks that precondition first and reports the exact blocker, so the
daily alert names what to fix rather than cascading selector timeouts, and the
feature does not sit quietly untested. Run it on its own with
`npm run cy:podcast`.

`cypress/e2e/podcast_processing/` covers what happens after an import — episodes
becoming segmented Messages on the linked playlist. That needs an `audiofiles`
queue worker consuming and `ffmpeg`/`ffprobe` installed on the target
environment, so it is **opt-in**: the suite self-skips unless
`--env podcastProcessing=true` is passed, which `npm run cy:podcast-processing`
does. In CI it runs as its own `continue-on-error` job and is left out of the
Slack pass/fail summary.

### Setup

1. **Enable the feature for the test org.** In voto5admin, the org needs both
   `ENABLE_PLAYLISTS` and `ENABLE_PODCASTS`, and the QA user needs
   `view-content` + `edit-content`. Without `ENABLE_PODCASTS` every
   `/resource/podcasts*` route 302s to `/home` and the nav item is hidden; the
   specs detect this and fail with one clear message rather than a wall of
   selector timeouts.

2. **Publish the RSS fixtures somewhere the CN can reach.** The podcast feature
   fetches feed and enclosure URLs **server-side**, so the fixtures in
   `cypress/fixtures/feeds/` have to be on a publicly reachable host — a private
   GitHub raw URL will not work. Publish them and point `podcastFeedBaseUrl` at
   the result:

   ```bash
   ./scripts/publish-podcast-feeds.sh https://<your-static-host>/voto-cypress-feeds ./dist-feeds
   # then serve ./dist-feeds and set podcastFeedBaseUrl in cypress.env.json
   ```

   The script bakes the base URL into each feed's `<enclosure>` because feeds
   reference their audio absolutely.

3. **The specs create and remove their own playlists.** A podcast permanently
   consumes an unlinked playlist, and deleting a podcast leaves its generated
   Messages behind, so reusing the org's playlists would exhaust them within a
   few runs. Anything a killed run leaks is named `[cy-podcast] <timestamp>` and
   can be swept by hand.

### Feed fixtures

| File | Exercises |
|---|---|
| `valid-25-items.xml` | 20-per-page episode browser and Load more |
| `valid-3-items.xml` | happy path |
| `long-episode.xml` | silence segmentation into several messages |
| `video-enclosure.xml` | unsupported-format rejection, sibling unaffected |
| `no-enclosure.xml` | "no audio" feed error |
| `no-pubdate.xml` | episodes skipped by the nightly sync |
| `zero-items.xml` | "The feed contains no episodes." |
| `malformed.xml` | "The feed could not be parsed." |
| `atom.xml` | Atom parsing path |
| `no-guid.xml` | synthetic GUID fallback |

Feed responses are cached for 300s per URL on the CN, so the page object appends
a cache-buster to every feed reference. Editing a fixture and re-running inside
five minutes would otherwise replay the old content.

## Support
Questions? Contact the Automation Initiative team or the repository maintainers.
