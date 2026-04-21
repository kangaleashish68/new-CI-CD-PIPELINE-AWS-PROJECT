// ══════════════════════════════════════════════════════
//   TASK MANAGER — Node.js Backend (server.js)
//   Routes: /register, /login, /logout
//           /tasks  (GET, POST, PUT, DELETE)
// ══════════════════════════════════════════════════════

require('dotenv').config();

const express        = require('express');
const mysql          = require('mysql2/promise');
const bcrypt         = require('bcryptjs');
const session        = require('express-session');
const cors           = require('cors');
const path           = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── MIDDLEWARE ───────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true, credentials: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'taskmanager_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 }  // 24 hrs
}));

// ── DATABASE CONNECTION ──────────────────────────────────
const dbConfig = {
  host:     process.env.DB_HOST     || 'localhost',
  port:     process.env.DB_PORT     || 3306,
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'taskmanager',
  waitForConnections: true,
  connectionLimit:    10,
};

let db;
(async () => {
  try {
    db = await mysql.createPool(dbConfig);
    await db.query('SELECT 1');                         // test connection
    console.log('✅  MySQL connected successfully');
    console.log(`🚀  Server running at http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌  MySQL connection failed:', err.message);
    console.log('ℹ️   Make sure MySQL is running and .env is configured');
  }
})();

// ── AUTH MIDDLEWARE ──────────────────────────────────────
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) return next();
  return res.status(401).json({ error: 'Not authenticated. Please login.' });
}

// ══════════════════════════════════════════════════════
//   AUTH ROUTES
// ══════════════════════════════════════════════════════

// POST /api/register — create new user
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password)
      return res.status(400).json({ error: 'All fields are required' });

    if (password.length < 6)
      return res.status(400).json({ error: 'Password must be at least 6 characters' });

    // Check if user already exists
    const [existing] = await db.query(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [email, username]
    );
    if (existing.length > 0)
      return res.status(409).json({ error: 'Username or email already taken' });

    // Hash password with bcrypt (salt rounds = 10)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into DB
    const [result] = await db.query(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );

    // Auto-login after register
    req.session.userId   = result.insertId;
    req.session.username = username;

    res.status(201).json({ message: 'Registered successfully', username });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// POST /api/login — authenticate user
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ error: 'Email and password are required' });

    // Find user by email
    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?', [email]
    );
    if (users.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user = users[0];

    // Compare password with bcrypt hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ error: 'Invalid email or password' });

    // Save session
    req.session.userId   = user.id;
    req.session.username = user.username;

    res.json({ message: 'Login successful', username: user.username });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// POST /api/logout — destroy session
app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ message: 'Logged out successfully' });
  });
});

// GET /api/me — get current logged-in user info
app.get('/api/me', requireAuth, (req, res) => {
  res.json({ userId: req.session.userId, username: req.session.username });
});

// ══════════════════════════════════════════════════════
//   TASK ROUTES (all protected — need login)
// ══════════════════════════════════════════════════════

// GET /api/tasks — fetch all tasks for logged-in user
app.get('/api/tasks', requireAuth, async (req, res) => {
  try {
    const [tasks] = await db.query(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC',
      [req.session.userId]
    );
    res.json(tasks);
  } catch (err) {
    console.error('Fetch tasks error:', err);
    res.status(500).json({ error: 'Could not fetch tasks' });
  }
});

// POST /api/tasks — create a new task
app.post('/api/tasks', requireAuth, async (req, res) => {
  try {
    const { title, description, priority } = req.body;

    if (!title)
      return res.status(400).json({ error: 'Task title is required' });

    const [result] = await db.query(
      'INSERT INTO tasks (user_id, title, description, priority) VALUES (?, ?, ?, ?)',
      [req.session.userId, title, description || '', priority || 'medium']
    );

    const [newTask] = await db.query(
      'SELECT * FROM tasks WHERE id = ?', [result.insertId]
    );

    res.status(201).json(newTask[0]);
  } catch (err) {
    console.error('Create task error:', err);
    res.status(500).json({ error: 'Could not create task' });
  }
});

// PUT /api/tasks/:id — update task status or details
app.put('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id }                        = req.params;
    const { title, description, status, priority } = req.body;

    // Verify task belongs to this user
    const [existing] = await db.query(
      'SELECT * FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.session.userId]
    );
    if (existing.length === 0)
      return res.status(404).json({ error: 'Task not found' });

    await db.query(
      `UPDATE tasks
       SET title = ?, description = ?, status = ?, priority = ?
       WHERE id = ? AND user_id = ?`,
      [
        title       || existing[0].title,
        description !== undefined ? description : existing[0].description,
        status      || existing[0].status,
        priority    || existing[0].priority,
        id,
        req.session.userId,
      ]
    );

    const [updated] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
    res.json(updated[0]);
  } catch (err) {
    console.error('Update task error:', err);
    res.status(500).json({ error: 'Could not update task' });
  }
});

// DELETE /api/tasks/:id — delete a task
app.delete('/api/tasks/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [result] = await db.query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, req.session.userId]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: 'Task not found' });

    res.json({ message: 'Task deleted', id: parseInt(id) });
  } catch (err) {
    console.error('Delete task error:', err);
    res.status(500).json({ error: 'Could not delete task' });
  }
});

// ── HEALTH CHECK (used by Docker & Jenkins) ──────────────
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// ── CATCH-ALL: serve index.html for SPA routing ──────────
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n📋  Task Manager App`);
  console.log(`🌐  http://localhost:${PORT}`);
});
