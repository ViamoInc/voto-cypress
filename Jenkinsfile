pipeline {
  agent any

  options {
    timestamps()
  }

  triggers {
    cron('''
H 6 * * 1-5
H 23 * * 1-5
''')
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install & Run Cypress') {
      steps {
   
        sh '''
          set -e
          npm ci
          npx cypress verify

          mkdir -p reports/junit

          echo "=== SMOKE ==="
          npx cypress run \
            --browser chrome \
            --reporter junit \
            --reporter-options "mochaFile=reports/junit/results-[hash].xml,toConsole=true" \
            --spec "cypress/e2e/smoke/**/*.cy.{js,ts}"

          echo "=== REGRESSION ==="
          npx cypress run \
            --browser chrome \
            --reporter junit \
            --reporter-options "mochaFile=reports/junit/results-[hash].xml,toConsole=true" \
            --spec "cypress/e2e/regression/**/*.cy.{js,ts}"
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
