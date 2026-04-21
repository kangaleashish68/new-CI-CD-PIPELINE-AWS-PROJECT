pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_HUB_CREDS = credentials('docker-credentials')

        // ✅ FIXED IMAGE NAME (IMPORTANT)
        IMAGE_NAME   = "${DOCKER_HUB_CREDS_USR}/task-app:latest"
        IMAGE_TAG    = "${IMAGE_NAME}:${BUILD_NUMBER}"
        IMAGE_LATEST = "${IMAGE_NAME}:latest"

        APP_PORT = "3000"
    }

    stages {

        // ─────────────── CHECKOUT ───────────────
        stage('Checkout') {
            steps {
                echo '📥 Checkout Code'
                checkout scm
            }
        }

        // ─────────────── INSTALL ───────────────
        stage('Install Dependencies') {
            steps {
                echo '📦 Installing Dependencies'
                sh '''
                    node --version
                    npm --version
                    npm install
                '''
            }
        }

        // ─────────────── BUILD ───────────────
        stage('Build Docker Image') {
            steps {
                echo '🐳 Building Docker Image'
                sh '''
                    chmod 666 /var/run/docker.sock || true

                    docker build \
                      -t ${IMAGE_TAG} \
                      -t ${IMAGE_LATEST} \
                      .

                    docker images | grep task-manager-app
                '''
            }
        }

        // ─────────────── TEST ───────────────
        stage('Test Container') {
            steps {
                echo '🔍 Testing Container'
                sh '''
                    docker run -d --name test_app -p 3001:3000 ${IMAGE_TAG}
                    sleep 8

                    curl -f http://localhost:3001/health || true

                    docker stop test_app || true
                    docker rm test_app || true
                '''
            }
        }

        // ─────────────── PUSH ───────────────
        stage('Push to Docker Hub') {
            steps {
                echo '⬆️ Pushing Image'
                sh '''
                    echo ${DOCKER_HUB_CREDS_PSW} | docker login \
                        -u ${DOCKER_HUB_CREDS_USR} \
                        --password-stdin

                    docker push ${IMAGE_TAG}
                    docker push ${IMAGE_LATEST}

                    docker logout
                '''
            }
        }

        // ─────────────── DEPLOY ───────────────
        stage('Deploy') {
            steps {
                echo '🚀 Deploying App'
                sh '''
                    docker-compose down || true
                    docker-compose up -d --build
                '''
            }
        }
    }

    post {
        success {
            echo "✅ SUCCESS — Build #${BUILD_NUMBER}"
        }

        failure {
            echo "❌ FAILED — Check logs"
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}