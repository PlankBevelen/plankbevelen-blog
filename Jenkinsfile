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
  }

  stages {
    stage('Resolve Environment') {
      steps {
        script {
          def branchName = env.BRANCH_NAME ?: env.GIT_BRANCH ?: sh(
            script: 'git rev-parse --abbrev-ref HEAD',
            returnStdout: true
          ).trim()
          branchName = branchName.replaceFirst(/^origin\//, '')

          if (branchName == 'dev') {
            env.DEPLOY_ENV = 'dev'
            env.SKIP_DEPLOY = 'true'
          } else if (branchName == 'test') {
            env.DEPLOY_ENV = 'test'
            env.SKIP_DEPLOY = 'false'
            env.HEALTH_URL = 'https://test.plankbevelen.cn/api/health'
          } else if (branchName == 'main') {
            env.DEPLOY_ENV = 'prod'
            env.SKIP_DEPLOY = 'false'
            env.HEALTH_URL = 'https://plankbevelen.cn/api/health'
          } else {
            error("Branch '${branchName}' is not deployable. Use dev for build-only, test for test deploy, or main for production deploy.")
          }

          env.GIT_COMMIT_SHORT = sh(script: 'git rev-parse --short=12 HEAD', returnStdout: true).trim()
          env.RELEASE_ID = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
          currentBuild.displayName = "#${env.BUILD_NUMBER} ${branchName} -> ${env.DEPLOY_ENV}"
        }
      }
    }

    stage('Install Dependencies') {
      steps {
        sh '''
          set -eux
          if command -v pnpm >/dev/null 2>&1; then
            pnpm --version
          elif command -v corepack >/dev/null 2>&1; then
            corepack enable
            corepack prepare pnpm@11.10.0 --activate
            pnpm --version
          elif command -v npm >/dev/null 2>&1; then
            npm install -g pnpm@11.10.0
            pnpm --version
          else
            echo "Node.js/npm/corepack/pnpm is missing on the Jenkins agent."
            exit 127
          fi
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

    stage('Package Release') {
      when {
        expression { env.SKIP_DEPLOY != 'true' }
      }
      steps {
        sh '''
          set -eux
          rm -f release.tar.gz
          tar -czf release.tar.gz .output ecosystem.config.cjs package.json pnpm-lock.yaml pnpm-workspace.yaml
        '''
      }
    }

    stage('Deploy') {
      when {
        expression { env.SKIP_DEPLOY != 'true' }
      }
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
