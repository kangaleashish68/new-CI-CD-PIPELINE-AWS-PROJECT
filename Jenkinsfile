```groovy
pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_HUB_CREDS = credentials('docker-credentials')
        IMAGE_NAME        = "${DOCKER_HUB_CREDS_USR}/task-manager-app"
        IMAGE_TAG         = "${IMAGE_NAME}:${BUILD_NUMBER}"
        IMAGE_LATEST      = "${IMAGE_NAME}:latest"

        K8S_NAMESPACE     = "taskmanager"
        K8S_DEPLOYMENT    = "taskmanager-app"
        K8S_CONTAINER     = "taskmanager-app"

        APP_PORT          = "3000"
        HEALTH_URL        = "http://localhost:${APP_PORT}/health"
    }

    stages {

        stage('Checkout') {
            steps {
                echo '📥 STAGE 1 — Checkout'
                checkout scm

                sh '''
                    echo "Branch  : $(git rev-parse --abbrev-ref HEAD)"
                    echo "Commit  : $(git rev-parse --short HEAD)"
                    echo "Message : $(git log -1 --pretty=%B)"
                    echo "Author  : $(git log -1 --pretty=%an)"
                '''
            }
        }

        stage('Install Dependencies') {
            steps {
                echo '📦 STAGE 2 — Install Dependencies'
                sh '''
                    node --version
                    npm --version
                    npm install
                '''
            }
        }

        stage('Code Quality Check') {
            steps {
                echo '🔍 STAGE 3 — Code Quality Check'
                sh '''
                    node --check server.js
                    du -sh public/ || true
                    du -sh node_modules/ || true
                    ls -la
                '''
            }
        }

        stage('Build Docker Image') {
            steps {
                echo '🐳 STAGE 4 — Build Docker Image'
                sh '''
                    chmod 666 /var/run/docker.sock || true

                    docker build \
                        -t ${IMAGE_TAG} \
                        -t ${IMAGE_LATEST} \
                        .

                    docker images ${IMAGE_NAME}
                '''
            }
        }

        stage('Push to Docker Hub') {
            steps {
                echo '⬆️ STAGE 5 — Push to Docker Hub'
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

        // ✅ FIXED DEPLOY STAGE
        stage('Deploy to Kubernetes') {
            steps {
                echo '☸️ STAGE 6 — Deploy to Kubernetes'

                withCredentials([file(credentialsId: 'kubeconfig',
                                      variable: 'KUBECONFIG')]) {

                    sh '''
                        export KUBECONFIG=$KUBECONFIG

                        echo "→ Cluster Info"
                        kubectl cluster-info

                        echo "→ Create namespace if not exists"
                        kubectl create namespace ${K8S_NAMESPACE} || true

                        echo "→ Apply manifests"
                        kubectl apply -f k8s/

                        echo "→ Update image"
                        kubectl set image deployment/${K8S_DEPLOYMENT} \
                            ${K8S_CONTAINER}=${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE} || true

                        echo "→ Rollout status"
                        kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                            -n ${K8S_NAMESPACE} \
                            --timeout=120s

                        kubectl get pods -n ${K8S_NAMESPACE}

                        echo "✅ Deployment successful"
                    '''
                }
            }
        }

        stage('Health Check') {
            steps {
                echo '🏥 STAGE 7 — Health Check'

                sh '''
                    sleep 20

                    RUNNING=$(kubectl get pods \
                        -n ${K8S_NAMESPACE} \
                        --field-selector=status.phase=Running \
                        --no-headers | wc -l)

                    if [ "${RUNNING}" -lt "1" ]; then
                        echo "❌ No running pods"
                        exit 1
                    fi

                    kubectl port-forward service/taskmanager-service \
                        ${APP_PORT}:${APP_PORT} \
                        -n ${K8S_NAMESPACE} &

                    PF_PID=$!
                    sleep 5

                    STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
                        http://localhost:${APP_PORT}/health || echo "000")

                    kill ${PF_PID} || true

                    if [ "${STATUS}" != "200" ]; then
                        echo "❌ Health check failed"
                        exit 1
                    fi

                    echo "✅ Health check passed"
                '''
            }
        }

        stage('Rollback') {
            when {
                expression { currentBuild.result == 'FAILURE' }
            }
            steps {
                echo '⏪ STAGE 8 — Rollback'

                sh '''
                    kubectl rollout undo deployment/${K8S_DEPLOYMENT} \
                        -n ${K8S_NAMESPACE}

                    kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                        -n ${K8S_NAMESPACE}
                '''
            }
        }
    }

    post {
        success {
            echo "✅ PIPELINE SUCCESS"
        }
        failure {
            echo "❌ PIPELINE FAILED"
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
```
