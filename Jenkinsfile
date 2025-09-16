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

  triggers {
    cron('H 6 * * 1-5')
  }

  environment {
    CYPRESS_baseUrl = 'https://darkmatter.votomobile.org'
    JUNIT_OUTPUT = 'reports/junit/results-[hash].xml'
  }

  stages {
    stage('Install & Run Cypress (All)') {
      steps {
        sh '''
          set -euxo pipefail
          npm ci
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
