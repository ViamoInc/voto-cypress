import io.viamo.jenkins.Cache

pipeline {
  agent { label 'common-env' }

  options {
    timestamps()
    buildDiscarder(logRotator(numToKeepStr: '50'))
    disableConcurrentBuilds()
    skipDefaultCheckout()
  }

  parameters {
    choice(name: 'CYPRESS_SUITE', choices: ['all', 'smoke', 'regression'], description: 'Subset of specs to execute')
  }

  environment {
    CYPRESS_baseUrl                  = 'https://darkmatter.votomobile.org'
    DOCKER_SHM_SIZE                  = '2g'
    NPM_CACHE_DIR                    = '/home/jenkins/.cache/npm'
    CYPRESS_ENV_CREDENTIAL_ID        = 'voto-cypress-env-json'
    CYPRESS_RECORD_KEY_CREDENTIAL_ID = 'voto-cypress-record-key'
  }

  stages {
    stage('Prepare Workspace') {
      steps {
        script {
          def uid = sh(returnStdout: true, script: 'id -u').trim()
          def gid = sh(returnStdout: true, script: 'id -g').trim()
          sh "docker run --rm -v ${env.WORKSPACE}:/workspace alpine sh -c 'chown -R ${uid}:${gid} /workspace || true'"
        }
        deleteDir()
      }
    }

    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Restore npm cache') {
      steps {
        script {
          Cache.restoreNodeModules(this)
        }
      }
    }

    stage('Render cypress.env.json') {
      steps {
        script {
          if (!fileExists('cypress.env.json')) {
            if (!env.CYPRESS_ENV_CREDENTIAL_ID?.trim()) {
              error('CYPRESS_ENV_CREDENTIAL_ID is not set and cypress.env.json is missing')
            }
            withCredentials([
              file(credentialsId: env.CYPRESS_ENV_CREDENTIAL_ID, variable: 'CYPRESS_ENV_FILE')
            ]) {
              sh "cp \"${CYPRESS_ENV_FILE}\" cypress.env.json"
            }
          }
        }
      }
    }

    stage('Run Cypress') {
      steps {
        script {
          def suite = params.CYPRESS_SUITE ?: 'all'
          def imageTag = "voto-cypress-ci:${env.BUILD_TAG ?: env.BUILD_NUMBER}"
          sh "mkdir -p ${env.NPM_CACHE_DIR}"

          def execute = {
            withEnv([
              "CI_IMAGE=${imageTag}",
              "NPM_CACHE_DIR=${env.NPM_CACHE_DIR}"
            ]) {
              sh "./scripts/run-just.sh docker-ci ${suite}"
            }
          }

          if (env.CYPRESS_RECORD_KEY_CREDENTIAL_ID?.trim()) {
            withCredentials([
              string(credentialsId: env.CYPRESS_RECORD_KEY_CREDENTIAL_ID, variable: 'CYPRESS_RECORD_KEY')
            ]) {
              execute()
            }
          } else {
            execute()
          }
        }
      }
    }
  }

  post {
    always {
      script {
        if (fileExists('node_modules')) {
          Cache.saveNodeModules(this)
        }
      }
      junit allowEmptyResults: true, testResults: 'cypress/reports/junit/*.xml'
      archiveArtifacts allowEmptyArchive: true, artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*'
    }
  }
}
