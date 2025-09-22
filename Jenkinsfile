pipeline {
  agent {
    docker {
      image 'cypress/included:13.7.3'             // Node + Chrome + Cypress
      args  '-u 1000:1000 --shm-size=2g'          // <<< change 1000:1000 to your Jenkins uid:gid if different
      reuseNode true
    }
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '50'))
    skipDefaultCheckout(true)
  }

  // Weekdays at 06:00 (server TZ). Adjust/remove if you wish.
  triggers { cron('H 6 * * 1-5') }

  parameters {
    booleanParam(name: 'SKIP_INSTALL', defaultValue: false, description: 'Force-skip dependency install (only safe if node_modules exists and lockfile unchanged).')
  }

  environment {
    CYPRESS_baseUrl        = 'https://staging.example.com'
    JUNIT_DIR              = 'cypress/reports/junit'
    JUNIT_OUTPUT           = 'cypress/reports/junit/results-[hash].xml'
    NPM_CONFIG_AUDIT       = 'false'
    NPM_CONFIG_FUND        = 'false'
    CYPRESS_INSTALL_BINARY = '0'    // image already has Cypress
  }

  stages {
    stage('Prepare workspace') {
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          id
          # Fix ownership in case previous runs wrote as a different user
          chown -R "$(id -u)":"$(id -g)" "$WORKSPACE" || true
        '''
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          # Keep node_modules to enable skip; clean everything else
          git clean -ffdX -e node_modules || true
        '''
      }
    }

    stage('Install deps (durable)') {
      when { expression { return !params.SKIP_INSTALL } }
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail

          # Detect if we can safely skip because lockfile matches what node_modules was built from
          LOCKFILE="package-lock.json"
          CACHE_MARKER=".npm-built-from-$(sha1sum "$LOCKFILE" | awk '{print $1}')"
          if [ -d node_modules ] && [ -f "$CACHE_MARKER" ]; then
            echo "[install] node_modules present and lockfile hash matches; skipping install."
            exit 0
          fi

          # Helper: run a command with a 12s keepalive that prints to the log
          run_with_keepalive () {
            ( while true; do echo "[keepalive] $1 ... $(date)"; sleep 12; done ) &
            KA=$!
            set +e
            bash -lc "$1"
            CODE=$?
            kill $KA || true
            set -e
            return $CODE
          }

          # 1) Install without running scripts (fast + less silent)
          run_with_keepalive "npm ci --no-progress --prefer-offline --loglevel=verbose --ignore-scripts"

          # 2) Rebuild native modules (chatty)
          run_with_keepalive "npm rebuild --loglevel=verbose || true"

          # 3) Run postinstall if present (chatty)
          run_with_keepalive "npm run postinstall --if-present --loglevel=verbose || true"

          # Mark cache with current lockfile hash so next build can skip
          rm -f .npm-built-from-* || true
          touch "$CACHE_MARKER"
        '''
      }
    }

    stage('Run Cypress (all specs)') {
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          npx cypress verify
          mkdir -p "${JUNIT_DIR}"

          # Run EVERYTHING under cypress/e2e/**
          npx cypress run \
            --browser chrome \
            --reporter junit \
            --reporter-options "mochaFile=${JUNIT_OUTPUT},toConsole=true"
        '''
      }
    }
  }

  post {
    always {
      junit allowEmptyResults: true, testResults: '${JUNIT_DIR}/*.xml'
      archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*'
    }
  }
}
