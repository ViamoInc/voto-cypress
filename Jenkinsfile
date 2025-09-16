pipeline {
  // Run everything inside the Cypress image (has Node+Chrome+Cypress)
  agent {
    docker {
      image 'cypress/included:13.7.3'
      // IMPORTANT: run as a non-root UID that matches your Jenkins user.
      // On Amazon Linux/Ubuntu, 'ec2-user' or 'jenkins' is typically uid 1000.
      // If your Jenkins user uses a different uid, change 1000:1000 to match.
      args '-u 1000:1000 --shm-size=2g'
      reuseNode true
    }
  }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '50'))
    // We will do an explicit checkout after fixing perms
    skipDefaultCheckout(true)
  }

  triggers { cron('H 6 * * 1-5') } // Weekdays 06:00; adjust/remove if you prefer

  environment {
    CYPRESS_baseUrl = 'https://darkmatter.votomobile.org'
    JUNIT_OUTPUT    = 'reports/junit/results-[hash].xml'
    NPM_CONFIG_AUDIT = 'false'
    NPM_CONFIG_FUND  = 'false'
  }

  stages {
    stage('Prepare workspace') {
      steps {
        sh '''
          set -euxo pipefail
          # Show current UID/GID so we know what owns files we create
          id

          # Take ownership of the workspace (in case previous runs wrote as a different user)
          # If you previously ran as root, some files may be root-owned; fix that now.
          chown -R $(id -u):$(id -g) "$WORKSPACE" || true

          # Remove stale node_modules that Git can't clean due to perms
          rm -rf node_modules || true
        '''
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
        // Optional: clean again now that perms are fixed
        sh 'git clean -ffdx || true'
      }
    }

    stage('Install & Run Cypress (All)') {
      steps {
        sh '''
          set -euxo pipefail

          # Heartbeat so Jenkins Durable Task never thinks we're idle
          ( while true; do echo "[heartbeat] npm still running $(date)"; sleep 30; done ) &
          HB=$!

          npm ci --no-progress --foreground-scripts --loglevel=info

          kill $HB || true

          npx cypress verify

          mkdir -p reports/junit

          # Run ALL tests (default cypress.config specPattern)
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
