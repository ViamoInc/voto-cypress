pipeline {
  agent {
    docker {
      image 'cypress/included:13.7.3'     // match your Cypress version
      args '-u root:root --shm-size=2g'   // more shared memory for Chrome
    }
  }

  options {
    timestamps()
    ansiColor('xterm')
    buildDiscarder(logRotator(numToKeepStr: '50'))
  }

  // Weekday schedules (Mon–Fri). Times use your Jenkins server timezone.
  // Morning smoke around 06:00, nightly regression around 23:00.
  triggers {
    cron('H 6 * * 1-5')   // Weekday morning smoke
    cron('H 23 * * 1-5')  // Weekday nightly regression
  }

  environment {
    // Point to your test env (override in Jenkins if needed)
    CYPRESS_baseUrl = 'https://darkmatter.votomobile.org'
    JUNIT_OUTPUT = 'reports/junit/results-[hash].xml'
  }

  stages {
    stage('Checkout') {
      steps { checkout scm }
    }

    stage('Install') {
      steps {
        sh '''
          node -v || true
          npm -v || true
          mkdir -p ~/.cache/Cypress
          npm ci
          npx cypress verify
        '''
      }
    }

    stage('Smoke (Weekdays AM)') {
      when { triggeredBy 'TimerTrigger' }
      steps {
        sh '''
          mkdir -p reports/junit
          npx cypress run \
            --browser chrome \
            --reporter junit \
            --reporter-options "mochaFile=${JUNIT_OUTPUT},toConsole=true" \
            --spec "cypress/e2e/smoke/**/*.cy.{js,ts}"
        '''
      }
      post {
        always {
          junit allowEmptyResults: true, testResults: 'reports/junit/*.xml'
          archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*'
        }
      }
    }

    stage('Regression (Weekdays PM, Matrix)') {
      when { triggeredBy 'TimerTrigger' }
      matrix {
        axes {
          axis { name 'BROWSER'; values 'chrome', 'firefox' }
          axis { name 'SHARD'; values '1', '2' } // simple 2-way split
        }
        stages {
          stage('Run') {
            steps {
              sh '''
                mkdir -p reports/junit
                # Basic file-based sharding; adjust if you prefer Cypress Cloud
                SPECS=$(ls -1 cypress/e2e/regression/**/*.cy.{js,ts} 2>/dev/null | sort)
                COUNT=$(echo "$SPECS" | wc -l | tr -d ' ')
                if [ "$COUNT" = "0" ]; then
                  echo "No regression specs found"; exit 0
                fi
                PER=$(( (COUNT + 2 - 1) / 2 ))
                if [ "$SHARD" = "1" ]; then
                  SELECTED=$(echo "$SPECS" | head -n $PER | tr '\n' ',' | sed 's/,$//')
                else
                  SELECTED=$(echo "$SPECS" | tail -n +$((PER+1)) | tr '\n' ',' | sed 's/,$//')
                fi

                npx cypress run \
                  --browser ${BROWSER} \
                  --reporter junit \
                  --reporter-options "mochaFile=${JUNIT_OUTPUT},toConsole=true" \
                  --spec "$SELECTED"
              '''
            }
          }
        }
        post {
          always { junit allowEmptyResults: true, testResults: 'reports/junit/*.xml' }
        }
      }
      post {
        always { archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*' }
      }
    }
  }
}
