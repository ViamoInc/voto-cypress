pipeline {
  agent {
    docker {
      image 'cypress/included:13.7.3'                
      args  '-u 1000:1000 --shm-size=2g'           
      reuseNode true
    }
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '50'))
    skipDefaultCheckout(true)
  }

   triggers { cron('H 6 * * 1-5') }

  parameters {
    booleanParam(name: 'SKIP_INSTALL', defaultValue: false, description: 'Skip npm ci (only safe if node_modules is already present & up-to-date)')
  }

  environment {
     CYPRESS_baseUrl     = 'https://darkmatter.votomobile.org'

    // JUnit output under your repo’s cypress/reports folder
    JUNIT_DIR           = 'cypress/reports/junit'
    JUNIT_OUTPUT        = 'cypress/reports/junit/results-[hash].xml'

    // npm / cypress install knobs
    NPM_CONFIG_AUDIT    = 'false'
    NPM_CONFIG_FUND     = 'false'
    CYPRESS_INSTALL_BINARY = '0'   // image already has Cypress; don’t download again
  }

  stages {
    stage('Prepare workspace') {
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          id
          # Fix ownership from any prior root-owned files
          chown -R "$(id -u)":"$(id -g)" "$WORKSPACE" || true
        '''
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          # Clean untracked files except node_modules (keep cache if we might skip install)
          git clean -ffdX -e node_modules || true
        '''
      }
    }

    stage('Install deps (npm ci)') {
      when { expression { return !params.SKIP_INSTALL } }
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail

          # Keep Jenkins log active by forcing line-buffered output from npm
          # stdbuf makes stdout/stderr line-buffered so the Durable Task wrapper sees activity
          if command -v stdbuf >/dev/null 2>&1; then
            STD="stdbuf -oL -eL"
          else
            STD=""
          fi

          # Be chatty enough for steady logs; skip cypress re-download via env above
          # If your agent’s FS is very slow, --prefer-offline usually helps.
          $STD npm ci --no-progress --loglevel=verbose --prefer-offline | tee npm-ci.log
        '''
      }
    }

    stage('Run Cypress (all specs)') {
      steps {
        sh '''#!/usr/bin/env bash
          set -euo pipefail
          npx cypress verify
          mkdir -p "${JUNIT_DIR}"

          # Run EVERYTHING under cypress/e2e/** (smoke_test, regression_test, other)
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
      archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*, npm-ci.log'
    }
  }
}
