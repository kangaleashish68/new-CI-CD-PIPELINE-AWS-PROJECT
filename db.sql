-- ══════════════════════════════════════════════════════
--   TASK MANAGER DATABASE SCHEMA
--   Run this file once to set up your MySQL database
-- ══════════════════════════════════════════════════════

-- 1. Create the database
CREATE DATABASE IF NOT EXISTS taskmanager;
USE taskmanager;

-- 2. USERS TABLE
--    Stores all registered users with hashed passwords
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  username    VARCHAR(50)  NOT NULL UNIQUE,
  email       VARCHAR(100) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,           -- bcrypt hashed
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. TASKS TABLE
--    Each task belongs to a user (user_id = foreign key)
CREATE TABLE IF NOT EXISTS tasks (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          NOT NULL,
  title       VARCHAR(200) NOT NULL,
  description TEXT,
  status      ENUM('pending', 'in-progress', 'completed') DEFAULT 'pending',
  priority    ENUM('low', 'medium', 'high') DEFAULT 'medium',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ── HOW THESE TABLES RELATE ─────────────────────────────
-- users.id  ──►  tasks.user_id
-- One user can have MANY tasks (One-to-Many relationship)
-- If a user is deleted → their tasks are also deleted (CASCADE)

-- ── SAMPLE DATA (optional, for testing) ─────────────────
-- INSERT INTO users (username, email, password) VALUES
--   ('demo', 'demo@example.com', '$2a$10$hashedpassword');
-- INSERT INTO tasks (user_id, title, description, status, priority) VALUES
--   (1, 'Setup project', 'Initialize Node.js and MySQL', 'completed', 'high'),
--   (1, 'Build UI', 'Create HTML and CSS frontend', 'in-progress', 'high'),
--   (1, 'Write Jenkinsfile', 'Configure CI/CD pipeline', 'pending', 'medium');
