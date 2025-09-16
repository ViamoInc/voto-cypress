pipeline {
  agent {
    docker {
      image 'cypress/included:13.7.3'
      args '-u root:root --shm-size=2g'
      reuseNode true
    }
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '50'))
  }

  triggers { cron('H 6 * * 1-5') } // Weekdays 06:00 – change/remove as you like

  environment {
    CYPRESS_baseUrl = 'https://darkmatter.votomobile.org'
    JUNIT_OUTPUT = 'reports/junit/results-[hash].xml'
    // Speed up npm a bit / reduce noise
    NPM_CONFIG_AUDIT = 'false'
    NPM_CONFIG_FUND  = 'false'
  }

  stages {
    stage('Install & Run Cypress (All)') {
      steps {
        sh '''
          set -euxo pipefail

          # Heartbeat to keep Jenkins log active while npm is busy
          ( while true; do echo "[heartbeat] npm still running $(date)"; sleep 30; done ) &
          HB=$!

          # Install deps (be verbose enough to keep output flowing)
          npm ci --no-progress --foreground-scripts --loglevel=info

          kill $HB || true

          # Verify Cypress is ready (fast in cypress/included)
          npx cypress verify

          mkdir -p reports/junit

          # Run ALL specs (default specPattern), headless Chrome
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
      junit allowEmptyResults: true, testResults: 'reports/junit/*.xml'
      archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*'
    }
  }
}
