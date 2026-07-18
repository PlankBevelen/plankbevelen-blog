pipeline {
  agent any

  options {
    buildDiscarder(logRotator(numToKeepStr: '20'))
    disableConcurrentBuilds()
    timestamps()
  }

  environment {
    APP_NAME = 'plankbevelen-blog'
    SERVER_HOST = '8.141.114.140'
    SERVER_USER = 'root'
    REMOTE_BASE = '/var/www/plankbevelen-blog'
    SSH_CREDENTIALS_ID = 'plankbevelen-prod-ssh'
  }

  stages {
    stage('Resolve environment') {
      steps {
        script {
          def branchName = env.BRANCH_NAME ?: env.GIT_BRANCH ?: sh(
            script: 'git rev-parse --abbrev-ref HEAD',
            returnStdout: true
          ).trim()
          branchName = branchName.replaceFirst(/^origin\//, '')

          if (branchName == 'dev') {
            env.DEPLOY_ENV = 'test'
            env.HEALTH_URL = 'https://test.plankbevelen.cn/api/health'
          } else if (branchName == 'main') {
            env.DEPLOY_ENV = 'prod'
            env.HEALTH_URL = 'https://plankbevelen.cn/api/health'
          } else {
            error("Branch '${branchName}' is not deployable. Use dev for test or main for production.")
          }

          env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
          env.RELEASE_ID = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
          currentBuild.displayName = "#${env.BUILD_NUMBER} ${branchName} -> ${env.DEPLOY_ENV}"
        }
      }
    }

    stage('Install') {
      steps {
        sh '''
          set -eux
          corepack enable
          corepack prepare pnpm@11.10.0 --activate
          pnpm --version
          pnpm install --frozen-lockfile
        '''
      }
    }

    stage('Build') {
      steps {
        sh '''
          set -eux
          pnpm build
          test -f .output/server/index.mjs
        '''
      }
    }

    stage('Package') {
      steps {
        sh '''
          set -eux
          rm -f release.tar.gz
          tar -czf release.tar.gz .output ecosystem.config.cjs package.json pnpm-lock.yaml pnpm-workspace.yaml
        '''
      }
    }

    stage('Deploy') {
      steps {
        sshagent(credentials: ['plankbevelen-prod-ssh']) {
          sh 'bash scripts/jenkins-deploy.sh'
        }
      }
    }
  }

  post {
    always {
      deleteDir()
    }
  }
}
