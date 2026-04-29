pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_HUB_CREDS = credentials('docker-credentials')

        IMAGE_NAME   = "${DOCKER_HUB_CREDS_USR}/task-manager-app"
        IMAGE_TAG    = "${IMAGE_NAME}:v1.${BUILD_NUMBER}"
        IMAGE_LATEST = "${IMAGE_NAME}:latest"

        K8S_NAMESPACE  = "taskmanager"
        K8S_DEPLOYMENT = "taskmanager-app"
        K8S_CONTAINER  = "taskmanager-app"

        APP_PORT = "3000"
    }

    stages {

        // 1. Checkout
        stage('Checkout') {
            steps {
                echo '📥 Checkout'
                checkout scm
            }
        }

        // 2. Install Dependencies
        stage('Install Dependencies') {
            steps {
                sh 'npm install'
            }
        }

        // 3. Code Quality Check
        stage('Code Quality Check') {
            steps {
                sh '''
                    node --check server.js
                    echo "Code OK"
                '''
            }
        }

        // 4. Build Docker Image
        stage('Build Docker Image') {
            steps {
                sh '''
                    chmod 666 /var/run/docker.sock || true

                    docker build \
                        -t ${IMAGE_TAG} \
                        -t ${IMAGE_LATEST} \
                        .
                '''
            }
        }

        // 5. Push to Docker Hub
        stage('Push to Docker Hub') {
            steps {
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

        // 6. Deploy to Kubernetes
        stage('Deploy to Kubernetes') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG

                        echo "Cluster Info:"
                        kubectl cluster-info

                        echo "Applying K8s configs..."
                        kubectl apply -f k8s/*.yaml

                        echo "Updating image..."
                        kubectl set image deployment/${K8S_DEPLOYMENT} \
                            ${K8S_CONTAINER}=${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}

                        echo "Waiting for rollout..."
                        kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                            -n ${K8S_NAMESPACE} \
                            --timeout=120s

                        sleep 20
                    '''
                }
            }
        }

        // 7. Health Check
        stage('Health Check') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG

                        kubectl get pods -n ${K8S_NAMESPACE}

                        RUNNING=$(kubectl get pods \
                            -n ${K8S_NAMESPACE} \
                            -l app=${K8S_DEPLOYMENT} \
                            --field-selector=status.phase=Running \
                            --no-headers | wc -l)

                        if [ "$RUNNING" -lt "1" ]; then
                            echo "No running pods"
                            exit 1
                        fi

                        kubectl port-forward service/taskmanager-service \
                            ${APP_PORT}:${APP_PORT} \
                            -n ${K8S_NAMESPACE} >/dev/null 2>&1 &

                        PF_PID=$!
                        sleep 5

                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
                            http://localhost:${APP_PORT}/health || echo "000")

                        kill $PF_PID || true

                        if [ "$STATUS" != "200" ]; then
                            echo "Health check failed"
                            exit 1
                        fi

                        echo "App is healthy"
                    '''
                }
            }
        }

        // 8. Rollback
        stage('Rollback') {
            when {
                expression { currentBuild.currentResult == 'FAILURE' }
            }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG

                        echo "Rolling back..."

                        kubectl rollout undo deployment/${K8S_DEPLOYMENT} \
                            -n ${K8S_NAMESPACE}

                        kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                            -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }
    }

    post {
        success {
            echo "✅ Pipeline Success: ${IMAGE_TAG}"
        }

        failure {
            echo "❌ Pipeline Failed"
            sh 'kubectl get pods -n taskmanager || true'
        }

        always {
            sh 'docker image prune -f || true'
        }
    }
}
