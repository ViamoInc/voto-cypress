pipeline {
  agent {
    docker {
      image 'cypress/included:13.7.3'           // Node + Chrome + Cypress
      args  '-u 1000:1000 --shm-size=2g'        // <<< change 1000:1000 to your Jenkins uid:gid if different
      reuseNode true
    }
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '50'))
    skipDefaultCheckout(true)
  }

  // Weekdays 06:00 (server TZ). Adjust/remove as you like.
  triggers { cron('H 6 * * 1-5') }

  environment {
    CYPRESS_baseUrl   = 'https://darkmatter.votomobile.org'
    JUNIT_DIR         = 'cypress/reports/junit'
    JUNIT_OUTPUT      = 'cypress/reports/junit/results-[hash].xml'
    NPM_CONFIG_AUDIT  = 'false'
    NPM_CONFIG_FUND   = 'false'
  }

  stages {
    stage('Prepare workspace') {
      steps {
        sh '''
          set -euxo pipefail
          id
          # Fix ownership from any previous root-owned files
          chown -R "$(id -u)":"$(id -g)" "$WORKSPACE" || true
          rm -rf node_modules || true
        '''
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
        sh 'git clean -ffdx || true'
      }
    }

    stage('Install deps') {
      steps {
        sh '''
          set -euxo pipefail

          # --- Correct order: background npm, THEN capture its PID ---
          npm ci --no-progress --foreground-scripts --loglevel=info &
          CI_PID=$!

          # Heartbeat loop while npm is running (updates log every 15s)
          while kill -0 "$CI_PID" 2>/dev/null; do
            echo "[heartbeat] npm ci still running $(date)"
            sleep 15
          done

          # Propagate npm's exit code
          wait "$CI_PID"

          # --------- Alternative keepalive (works too) ----------
          # ( while true; do echo "[keepalive] $(date)"; sleep 15; done ) &
          # KA=$!
          # trap "kill $KA || true" EXIT
          # npm ci --no-progress --foreground-scripts --loglevel=info
          # kill $KA || true
          # ------------------------------------------------------
        '''
      }
    }

    stage('Run Cypress (all specs)') {
      steps {
        sh '''
          set -euxo pipefail
          npx cypress verify
          mkdir -p "${JUNIT_DIR}"

          # Run EVERYTHING under cypress/e2e/** (your folders: smoke_test, regression_test, other)
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
