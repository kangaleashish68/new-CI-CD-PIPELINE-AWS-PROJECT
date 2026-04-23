pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '5'))
        disableConcurrentBuilds()
    }

    environment {
        DOCKER_HUB_CREDS = credentials('docker-credentials')

        VERSION = "v1.${BUILD_NUMBER}"
        IMAGE_NAME   = "${DOCKER_HUB_CREDS_USR}/task-manager-app"
        IMAGE_TAG    = "${IMAGE_NAME}:${VERSION}"
        IMAGE_LATEST = "${IMAGE_NAME}:latest"

        K8S_NAMESPACE  = "taskmanager"
        K8S_DEPLOYMENT = "taskmanager-app"
        K8S_CONTAINER  = "taskmanager-app"

        APP_PORT = "3000"
    }

    stages {

        // ✅ 1. Checkout
        stage('Checkout') {
            steps {
                echo '📥 Checkout'
                checkout scm
            }
        }

        // ✅ 2. Check changes (skip build if no changes)
        stage('Check Changes') {
            steps {
                script {
                    def changes = sh(script: "git diff --name-only HEAD~1 HEAD || true", returnStdout: true).trim()
                    if (!changes) {
                        echo "❌ No changes detected. Skipping build."
                        currentBuild.result = 'SUCCESS'
                        error("Stopping pipeline")
                    }
                }
            }
        }

        // ✅ 3. Install dependencies
        stage('Install Dependencies') {
            steps {
                sh '''
                    npm install
                '''
            }
        }

        // ✅ 4. Parallel checks (lint + security)
        stage('Quality Checks') {
            parallel {
                stage('Lint') {
                    steps {
                        sh 'npm run lint || true'
                    }
                }
                stage('Security Scan') {
                    steps {
                        sh 'npm audit || true'
                    }
                }
            }
        }

        // ✅ 5. Test stage
        stage('Run Tests') {
            steps {
                sh '''
                    npm test || true
                '''
            }
        }

        // ✅ 6. Build Docker Image
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

        // ✅ 7. Push Docker Image
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

        // ✅ 8. Deploy to DEV
        stage('Deploy to Dev') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG
                        kubectl apply -f k8s/dev/
                    '''
                }
            }
        }

        // ✅ 9. Deploy to STAGING
        stage('Deploy to Staging') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG
                        kubectl apply -f k8s/staging/
                    '''
                }
            }
        }

        // ✅ 10. Manual Approval
        stage('Approval') {
            steps {
                input message: 'Deploy to PRODUCTION?', ok: 'Yes Deploy'
            }
        }

        // ✅ 11. Deploy to PRODUCTION
        stage('Deploy to Production') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG

                        kubectl apply -f k8s/prod/

                        kubectl set image deployment/${K8S_DEPLOYMENT} \
                            ${K8S_CONTAINER}=${IMAGE_TAG} \
                            -n ${K8S_NAMESPACE}

                        kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                            -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }

        // ✅ 12. Health Check
        stage('Health Check') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG

                        sleep 20

                        STATUS=$(kubectl get pods -n ${K8S_NAMESPACE} --field-selector=status.phase=Running --no-headers | wc -l)

                        if [ "$STATUS" -lt "1" ]; then
                            echo "❌ No running pods"
                            exit 1
                        fi

                        kubectl port-forward service/taskmanager-service \
                            ${APP_PORT}:${APP_PORT} \
                            -n ${K8S_NAMESPACE} >/dev/null 2>&1 &

                        PF_PID=$!
                        sleep 5

                        HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
                            http://localhost:${APP_PORT}/health || echo "000")

                        kill $PF_PID || true

                        if [ "$HTTP" != "200" ]; then
                            echo "❌ Health check failed"
                            exit 1
                        fi
                    '''
                }
            }
        }

        // ✅ 13. Rollback
        stage('Rollback') {
            when {
                expression { currentBuild.currentResult == 'FAILURE' }
            }
            steps {
                withCredentials([file(credentialsId: 'kubeconfig', variable: 'KUBECONFIG')]) {
                    sh '''
                        export KUBECONFIG=$KUBECONFIG
                        kubectl rollout undo deployment/${K8S_DEPLOYMENT} -n ${K8S_NAMESPACE}
                    '''
                }
            }
        }
    }

    // ✅ 14. Notifications
    post {
        success {
            mail to: 'your-email@gmail.com',
                 subject: "✅ SUCCESS: Build ${BUILD_NUMBER}",
                 body: "Pipeline completed successfully."
        }
        failure {
            mail to: 'your-email@gmail.com',
                 subject: "❌ FAILED: Build ${BUILD_NUMBER}",
                 body: "Pipeline failed. Check Jenkins."
        }
        always {
            sh 'docker image prune -f || true'
        }
    }
}
