pipeline {
  agent {
    docker {
      image 'cypress/included:13.7.3'
      // Use the same uid:gid as your Jenkins user. If it's not 1000:1000, change it.
      args '-u 1000:1000 --shm-size=2g'
      reuseNode true
    }
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '50'))
    skipDefaultCheckout(true)
  }

  // Weekdays 06:00 (server TZ). Adjust or remove if you prefer.
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
          chown -R $(id -u):$(id -g) "$WORKSPACE" || true
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
          npm ci --no-progress --foreground-scripts --loglevel=info &
          CI_PID=$!
          while kill -0 "$CI_PID" 2>/dev/null; do
            echo "[heartbeat] npm ci still running $(date)"
            sleep 20
          done
          wait "$CI_PID"
        '''
      }
    }

    stage('Run Cypress (all specs)') {
      steps {
        sh '''
          set -euxo pipefail
          npx cypress verify
          mkdir -p "${JUNIT_DIR}"

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
