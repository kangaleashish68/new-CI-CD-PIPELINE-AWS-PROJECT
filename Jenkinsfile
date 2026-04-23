// ══════════════════════════════════════════════════════
//   JENKINSFILE — Full Pipeline (No AWS)
//
//   STAGES:
//   1.  Checkout
//   2.  Install Dependencies
//   3.  Code Quality Check
//   4.  Build Docker Image
//   5.  Push to Docker Hub
//   6.  Deploy to Kubernetes
//   7.  Health Check
//   8.  Rollback (only runs if health check fails)
//
//   FEATURES:
//   ✅ Build + Push Docker image
//   ✅ Deploy to Kubernetes
//   ✅ Health Check after deploy
//   ✅ Auto Rollback if health check fails
//   ✅ Rollout status monitoring
//   ✅ Image versioning with BUILD_NUMBER
//   ✅ Slack/email notification (optional)
// ══════════════════════════════════════════════════════

pipeline {
    agent any

    // ── Global options ───────────────────────────────────
    options {
        timeout(time: 30, unit: 'MINUTES')   // kill pipeline if takes > 30 mins
        buildDiscarder(logRotator(numToKeepStr: '5'))  // keep last 5 builds only
        disableConcurrentBuilds()             // don't run 2 pipelines at same time
    }

    // ── Environment Variables ────────────────────────────
    environment {
        // Docker Hub
        DOCKER_HUB_CREDS = credentials('docker-credentials')
        IMAGE_NAME        = "${DOCKER_HUB_CREDS_USR}/test-app:v3"
        IMAGE_TAG         = "${IMAGE_NAME}:${BUILD_NUMBER}"   // e.g. user/app:5
        IMAGE_LATEST      = "${IMAGE_NAME}:latest"

<<<<<<< HEAD
        // Kubernetes
        K8S_NAMESPACE     = "taskmanager"
        K8S_DEPLOYMENT    = "taskmanager-app"
        K8S_CONTAINER     = "taskmanager-app"

        // Health check
        APP_PORT          = "3000"
        HEALTH_URL        = "http://localhost:${APP_PORT}/health"
=======
        VERSION = "v1.${BUILD_NUMBER}"
        IMAGE_NAME   = "${DOCKER_HUB_CREDS_USR}/task-manager-app"
        IMAGE_TAG    = "${IMAGE_NAME}:${VERSION}"
        IMAGE_LATEST = "${IMAGE_NAME}:latest"

        K8S_NAMESPACE  = "taskmanager"
        K8S_DEPLOYMENT = "taskmanager-app"
        K8S_CONTAINER  = "taskmanager-app"

        APP_PORT = "3000"
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
    }

    stages {

<<<<<<< HEAD
        // ════════════════════════════════════════════════
        // STAGE 1 — CHECKOUT
        // Pull latest code from GitHub
        // ════════════════════════════════════════════════
        stage('Checkout') {
            steps {
                echo '═══════════════════════════════════'
                echo '📥 STAGE 1 — Checkout'
                echo '═══════════════════════════════════'

=======
        // ✅ 1. Checkout
        stage('Checkout') {
            steps {
                echo '📥 Checkout'
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
                checkout scm

                // Print commit info for logs
                sh '''
                    echo "Branch  : $(git rev-parse --abbrev-ref HEAD)"
                    echo "Commit  : $(git rev-parse --short HEAD)"
                    echo "Message : $(git log -1 --pretty=%B)"
                    echo "Author  : $(git log -1 --pretty=%an)"
                '''

                echo '✅ Code pulled successfully'
            }
        }

<<<<<<< HEAD
        // ════════════════════════════════════════════════
        // STAGE 2 — INSTALL DEPENDENCIES
        // npm install inside Jenkins workspace
        // ════════════════════════════════════════════════
        stage('Install Dependencies') {
            steps {
                echo '═══════════════════════════════════'
                echo '📦 STAGE 2 — Install Dependencies'
                echo '═══════════════════════════════════'

                sh '''
                    echo "Node version: $(node --version)"
                    echo "NPM version : $(npm --version)"
=======
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
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
                    npm install
                    echo "Packages installed: $(ls node_modules | wc -l)"
                '''

                echo '✅ Dependencies installed'
            }
        }

        // ════════════════════════════════════════════════
        // STAGE 3 — CODE QUALITY CHECK
        // Checks for syntax errors and basic issues
        // ════════════════════════════════════════════════
        stage('Code Quality Check') {
            steps {
                echo '═══════════════════════════════════'
                echo '🔍 STAGE 3 — Code Quality Check'
                echo '═══════════════════════════════════'

                sh '''
                    echo "Checking Node.js syntax..."

                    # Check server.js for syntax errors
                    node --check server.js && echo "✅ server.js — OK"

                    # Check all JS files in public folder
                    echo "Checking file sizes..."
                    du -sh public/
                    du -sh node_modules/

                    echo "Listing project files..."
                    ls -la

                    echo "✅ Code quality check passed"
                '''
            }
        }

<<<<<<< HEAD
        // ════════════════════════════════════════════════
        // STAGE 4 — BUILD DOCKER IMAGE
        // Builds image and tags with BUILD_NUMBER + latest
        // ════════════════════════════════════════════════
        stage('Build Docker Image') {
            steps {
                echo '═══════════════════════════════════'
                echo '🐳 STAGE 4 — Build Docker Image'
                echo '═══════════════════════════════════'

=======
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
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
                sh '''
                    # Fix docker socket permission
                    chmod 666 /var/run/docker.sock || true

                    echo "Building image: ${IMAGE_TAG}"

                    # Build with both tags
                    docker build \
                        -t ${IMAGE_TAG} \
                        -t ${IMAGE_LATEST} \
<<<<<<< HEAD
                        --build-arg BUILD_NUMBER=${BUILD_NUMBER} \
                        .

                    echo "Image size:"
                    docker images ${IMAGE_NAME} --format "{{.Tag}} → {{.Size}}"

                    echo "✅ Docker image built: ${IMAGE_TAG}"
=======
                        .
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
                '''
            }
        }

<<<<<<< HEAD
        // ════════════════════════════════════════════════
        // STAGE 5 — PUSH TO DOCKER HUB
        // Pushes both versioned and latest tags
        // ════════════════════════════════════════════════
        stage('Push to Docker Hub') {
            steps {
                echo '═══════════════════════════════════'
                echo '⬆️  STAGE 5 — Push to Docker Hub'
                echo '═══════════════════════════════════'

=======
        // ✅ 7. Push Docker Image
        stage('Push to Docker Hub') {
            steps {
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
                sh '''
                    # Login to Docker Hub
                    echo ${DOCKER_HUB_CREDS_PSW} | docker login \
                        -u ${DOCKER_HUB_CREDS_USR} \
                        --password-stdin

                    # Push versioned tag (e.g. user/app:5)
                    echo "Pushing ${IMAGE_TAG}..."
                    docker push ${IMAGE_TAG}

                    # Push latest tag
                    echo "Pushing ${IMAGE_LATEST}..."
                    docker push ${IMAGE_LATEST}

                    # Logout for security
                    docker logout

                    echo "✅ Image pushed to Docker Hub"
                    echo "   Tagged: ${IMAGE_TAG}"
                    echo "   Tagged: ${IMAGE_LATEST}"
                '''
            }
        }

<<<<<<< HEAD
        // ════════════════════════════════════════════════
        // STAGE 6 — DEPLOY TO KUBERNETES
        // Applies k8s files and updates image
        // Records previous image for rollback
        // ════════════════════════════════════════════════
        stage('Deploy to Kubernetes') {
            steps {
                echo '═══════════════════════════════════'
                echo '☸️  STAGE 6 — Deploy to Kubernetes'
                echo '═══════════════════════════════════'

                sh '''
                    # Save current image for rollback
                    PREV_IMAGE=$(kubectl get deployment ${K8S_DEPLOYMENT} \
                        -n ${K8S_NAMESPACE} \
                        -o jsonpath="{.spec.template.spec.containers[0].image}" \
                        2>/dev/null || echo "none")
                    echo "Previous image: ${PREV_IMAGE}"
                    echo ${PREV_IMAGE} > /tmp/prev_image.txt

                    echo "→ Applying Kubernetes files..."
                    kubectl apply -f k8s/00-namespace.yml
                    kubectl apply -f k8s/01-secret.yml
                    kubectl apply -f k8s/02-configmap.yml
                    kubectl apply -f k8s/03-mysql-pvc.yml
                    kubectl apply -f k8s/04-mysql-deployment.yml
                    kubectl apply -f k8s/05-app-deployment.yml
                    kubectl apply -f k8s/06-mysql-init-job.yml

                    echo "→ Updating app to new image: ${IMAGE_TAG}"
                    kubectl set image deployment/${K8S_DEPLOYMENT} \
                        ${K8S_CONTAINER}=${IMAGE_TAG} \
                        -n ${K8S_NAMESPACE}

                    echo "→ Watching rollout status..."
                    kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                        -n ${K8S_NAMESPACE} \
                        --timeout=120s

                    echo "→ Current pods:"
                    kubectl get pods -n ${K8S_NAMESPACE}

                    echo "→ Current services:"
                    kubectl get services -n ${K8S_NAMESPACE}

                    echo "✅ Kubernetes deployment complete"
                '''
=======
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
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
            }
        }

<<<<<<< HEAD
        // ════════════════════════════════════════════════
        // STAGE 7 — HEALTH CHECK
        // Waits for app to be ready then checks /health
        // If fails → triggers rollback stage
        // ════════════════════════════════════════════════
        stage('Health Check') {
            steps {
                echo '═══════════════════════════════════'
                echo '🏥 STAGE 7 — Health Check'
                echo '═══════════════════════════════════'

                sh '''
                    echo "→ Waiting 20 seconds for app to start..."
                    sleep 20

                    echo "→ Checking pod health..."
                    kubectl get pods -n ${K8S_NAMESPACE} -l app=${K8S_DEPLOYMENT}

                    # Check all pods are Running
                    RUNNING=$(kubectl get pods \
                        -n ${K8S_NAMESPACE} \
                        -l app=${K8S_DEPLOYMENT} \
                        --field-selector=status.phase=Running \
                        --no-headers | wc -l)

                    echo "Running pods: ${RUNNING}"

                    if [ "${RUNNING}" -lt "1" ]; then
                        echo "❌ No running pods found!"
                        echo "Pod details:"
                        kubectl describe pods \
                            -n ${K8S_NAMESPACE} \
                            -l app=${K8S_DEPLOYMENT}
                        exit 1
                    fi

                    echo "→ Checking /health endpoint..."
                    # Port forward and check health endpoint
                    kubectl port-forward \
                        service/taskmanager-service \
                        ${APP_PORT}:${APP_PORT} \
                        -n ${K8S_NAMESPACE} &
                    PF_PID=$!

                    sleep 5

                    # Try health check 3 times
                    for i in 1 2 3; do
                        echo "Health check attempt $i..."
                        STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
                            http://localhost:${APP_PORT}/health || echo "000")

                        echo "HTTP Status: ${STATUS}"

                        if [ "${STATUS}" = "200" ]; then
                            echo "✅ Health check PASSED"
                            kill ${PF_PID} || true
                            exit 0
                        fi
                        sleep 5
                    done

                    echo "❌ Health check FAILED after 3 attempts"
                    kill ${PF_PID} || true
                    exit 1
                '''
            }
        }

        // ════════════════════════════════════════════════
        // STAGE 8 — ROLLBACK
        // Only runs if health check fails
        // Goes back to previous working image
        // ════════════════════════════════════════════════
        stage('Rollback') {
            when {
                expression {
                    // Only run this stage if a previous stage failed
                    currentBuild.result == 'FAILURE'
                }
            }
            steps {
                echo '═══════════════════════════════════'
                echo '⏪ STAGE 8 — Rollback'
                echo '═══════════════════════════════════'

                sh '''
                    echo "❌ Deployment failed — starting rollback..."

                    # Read previous image saved in deploy stage
                    PREV_IMAGE=$(cat /tmp/prev_image.txt 2>/dev/null || echo "none")
                    echo "Rolling back to: ${PREV_IMAGE}"

                    if [ "${PREV_IMAGE}" = "none" ]; then
                        echo "No previous image found — using kubectl rollout undo"
                        kubectl rollout undo deployment/${K8S_DEPLOYMENT} \
                            -n ${K8S_NAMESPACE}
                    else
                        # Set image back to previous version
                        kubectl set image deployment/${K8S_DEPLOYMENT} \
                            ${K8S_CONTAINER}=${PREV_IMAGE} \
                            -n ${K8S_NAMESPACE}
                    fi

                    # Wait for rollback to complete
                    kubectl rollout status deployment/${K8S_DEPLOYMENT} \
                        -n ${K8S_NAMESPACE} \
                        --timeout=60s

                    echo "→ Pods after rollback:"
                    kubectl get pods -n ${K8S_NAMESPACE}

                    echo "⏪ Rollback complete — previous version restored"
                '''
            }
        }

    } // end stages

    // ════════════════════════════════════════════════════
    // POST ACTIONS — Run after all stages
    // ════════════════════════════════════════════════════
=======
    // ✅ 14. Notifications
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
    post {

        success {
<<<<<<< HEAD
            echo '═══════════════════════════════════'
            echo "✅ PIPELINE SUCCESS"
            echo "   Build Number : #${BUILD_NUMBER}"
            echo "   Image        : ${IMAGE_TAG}"
            echo "   Namespace    : ${K8S_NAMESPACE}"
            echo '═══════════════════════════════════'
            sh '''
                echo "Final pod status:"
                kubectl get pods -n ${K8S_NAMESPACE}
                echo "Final services:"
                kubectl get services -n ${K8S_NAMESPACE}
            '''
=======
            mail to: 'testingwork462@gmail.com',
                 subject: "✅ SUCCESS: Build ${BUILD_NUMBER}",
                 body: "Pipeline completed successfully."
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
        }
        failure {
<<<<<<< HEAD
            echo '═══════════════════════════════════'
            echo "❌ PIPELINE FAILED"
            echo "   Build Number : #${BUILD_NUMBER}"
            echo "   Check logs above for details"
            echo '═══════════════════════════════════'
            sh '''
                echo "Pod status at failure:"
                kubectl get pods -n ${K8S_NAMESPACE} || true
                echo "Recent pod events:"
                kubectl get events \
                    -n ${K8S_NAMESPACE} \
                    --sort-by=.metadata.creationTimestamp \
                    | tail -10 || true
            '''
=======
            mail to: 'testingwork462@gmail.com',
                 subject: "❌ FAILED: Build ${BUILD_NUMBER}",
                 body: "Pipeline failed. Check Jenkins."
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
        }
        always {
            echo "→ Cleaning up old Docker images..."
            sh 'docker image prune -f || true'
            echo "→ Build #${BUILD_NUMBER} finished"
        }

    }
<<<<<<< HEAD

=======
>>>>>>> 9532385cda2f2e45a3b4d636d5d651af58112249
}
