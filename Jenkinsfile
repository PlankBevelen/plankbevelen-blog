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
    PNPM_VERSION = '11.10.0'
    NVM_DIR = '/var/lib/jenkins/.nvm'
    NODE_VERSION = '22'
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
          export NVM_DIR="/var/lib/jenkins/.nvm"
          [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
          nvm use ${NODE_VERSION}

          export NPM_CONFIG_PREFIX="$WORKSPACE/.npm-global"
          export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"

          node -v
          npm -v

          npm install -g pnpm@${PNPM_VERSION}
          pnpm --version
          pnpm config set store-dir "$HOME/.pnpm-store"
          pnpm install --frozen-lockfile
        '''
      }
    }

    stage('Build') {
      steps {
        sh '''
          set -eux
          export NVM_DIR="/var/lib/jenkins/.nvm"
          [ -s "$NVM_DIR/nvm.sh" ] && \\. "$NVM_DIR/nvm.sh"
          nvm use ${NODE_VERSION}

          export NPM_CONFIG_PREFIX="$WORKSPACE/.npm-global"
          export PATH="$NPM_CONFIG_PREFIX/bin:$PATH"

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