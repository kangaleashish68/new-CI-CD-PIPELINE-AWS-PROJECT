# TaskFlow — Task Manager Web App
> Full-stack CI/CD project · Node.js · MySQL · Docker · Jenkins · AWS

---

## 📁 Project Structure

```
task-manager-app/
├── public/
│   ├── index.html        ← Login / Register page
│   ├── dashboard.html    ← Main task manager UI
│   └── style.css         ← All styles
├── server.js             ← Node.js + Express backend
├── db.sql                ← MySQL schema (run once)
├── package.json          ← Node dependencies
├── .env.example          ← Environment variables template
├── Dockerfile            ← Containerize the app
├── docker-compose.yml    ← Run app + MySQL together
├── Jenkinsfile           ← CI/CD pipeline
└── .gitignore
```

---

## 🚀 Option A — Run Locally (without Docker)

### Step 1: Install Node.js
Download from https://nodejs.org (v18+)

### Step 2: Setup MySQL
```sql
-- In MySQL Workbench or terminal:
mysql -u root -p
source /path/to/db.sql
```

### Step 3: Configure environment
```bash
cp .env.example .env
# Edit .env with your MySQL password
```

### Step 4: Install & start
```bash
npm install
npm start
```

### Step 5: Open browser
```
http://localhost:3000
```

---

## 🐳 Option B — Run with Docker Compose (recommended)

```bash
docker-compose up --build
```
> App starts at http://localhost:3000
> MySQL runs in a container and is auto-configured

---

## 🌐 API Endpoints

| Method | Route            | Description              | Auth Required |
|--------|-----------------|--------------------------|---------------|
| POST   | /api/register   | Create new user          | No            |
| POST   | /api/login      | Login user               | No            |
| POST   | /api/logout     | Logout user              | No            |
| GET    | /api/me         | Get current user info    | Yes           |
| GET    | /api/tasks      | Get all user's tasks     | Yes           |
| POST   | /api/tasks      | Create new task          | Yes           |
| PUT    | /api/tasks/:id  | Update task              | Yes           |
| DELETE | /api/tasks/:id  | Delete task              | Yes           |
| GET    | /health         | Health check             | No            |

---

## 🗄️ Database Tables

**users**
```
id | username | email | password (bcrypt) | created_at
```

**tasks**
```
id | user_id | title | description | status | priority | created_at | updated_at
```

---

## ⚙️ Jenkins CI/CD Pipeline

1. **Checkout** — Pull code from GitHub
2. **Install** — npm install
3. **Build** — Docker build
4. **Test** — Health check container
5. **Push** — Push to Docker Hub
6. **Deploy** — docker-compose up

---

## 🏆 Interview Answer

**Paragraph 1:** I built a production-style Task Manager web application using Node.js for the backend, MySQL for data storage, and HTML/CSS for the frontend. Users can register, log in, create tasks with priority levels, update task status (pending, in-progress, completed), and delete tasks. The backend uses Express.js with session-based authentication and bcrypt password hashing, while MySQL stores users and tasks in a relational schema with a foreign key relationship.

**Paragraph 2:** For the DevOps side, I containerized the application using Docker and used Docker Compose to orchestrate the app and MySQL together. I configured a Jenkins CI/CD pipeline that automatically pulls code from GitHub, builds the Docker image, runs a health check test, pushes to Docker Hub, and deploys to the server — all without manual intervention. This project mirrors real-world software delivery workflows used in modern engineering teams.
