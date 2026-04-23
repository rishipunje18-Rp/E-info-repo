import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database('einfo.db');

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    role TEXT
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    date TEXT,
    venue TEXT,
    purpose TEXT,
    target_audience TEXT,
    description TEXT,
    poster_url TEXT,
    status TEXT DEFAULT 'published',
    show_resources INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    event_id INTEGER,
    name TEXT,
    department TEXT,
    year TEXT,
    roll TEXT,
    registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id),
    FOREIGN KEY(event_id) REFERENCES events(id)
  );

  CREATE TABLE IF NOT EXISTS media (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_id INTEGER,
    file_path TEXT,
    file_type TEXT,
    category TEXT DEFAULT 'gallery',
    FOREIGN KEY(event_id) REFERENCES events(id)
  );
`);

// Insert Admin if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE email = ?').get('admin@einfo.com');
if (!adminExists) {
  db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run('admin@einfo.com', 'admin123', 'admin');
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '50mb' }));

  // --- API Routes ---

  // Auth
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    
    // Admin check
    if (email === 'admin@einfo.com' && password === 'admin123') {
      const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      return res.json({ user });
    }

    // Student check
    if (password.length < 4) {
      return res.status(400).json({ error: 'Password must be at least 4 characters' });
    }

    let user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      // Auto-register student
      const result = db.prepare('INSERT INTO users (email, password, role) VALUES (?, ?, ?)').run(email, password, 'student');
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    } else if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ user });
  });

  // Events
  app.get('/api/events', (req, res) => {
    const events = db.prepare('SELECT * FROM events ORDER BY date DESC').all();
    res.json(events);
  });

  app.post('/api/events', (req, res) => {
    const { title, date, venue, purpose, target_audience, description, poster_url, show_resources } = req.body;
    const result = db.prepare(`
      INSERT INTO events (title, date, venue, purpose, target_audience, description, poster_url, show_resources)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(title, date, venue, purpose, target_audience, description, poster_url, show_resources || 0);
    res.json({ id: result.lastInsertRowid });
  });

  app.put('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const { title, date, venue, purpose, target_audience, description, poster_url, show_resources, status } = req.body;
    db.prepare(`
      UPDATE events 
      SET title = ?, date = ?, venue = ?, purpose = ?, target_audience = ?, description = ?, poster_url = ?, show_resources = ?, status = ?
      WHERE id = ?
    `).run(title, date, venue, purpose, target_audience, description, poster_url, show_resources, status, id);
    res.json({ success: true });
  });

  app.delete('/api/events/:id', (req, res) => {
    const { id } = req.params;
    const eventId = Number(id);
    db.prepare('DELETE FROM events WHERE id = ?').run(eventId);
    db.prepare('DELETE FROM registrations WHERE event_id = ?').run(eventId);
    db.prepare('DELETE FROM media WHERE event_id = ?').run(eventId);
    res.json({ success: true });
  });

  // Registrations
  app.post('/api/registrations', (req, res) => {
    const { user_id, event_id, name, department, year, roll } = req.body;
    const existing = db.prepare('SELECT * FROM registrations WHERE user_id = ? AND event_id = ?').get(user_id, event_id);
    if (existing) return res.status(400).json({ error: 'Already registered' });
    
    db.prepare(`
      INSERT INTO registrations (user_id, event_id, name, department, year, roll) 
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(user_id, event_id, name, department, year, roll);
    res.json({ success: true });
  });

  app.get('/api/registrations/user/:userId', (req, res) => {
    const { userId } = req.params;
    const registrations = db.prepare(`
      SELECT e.* FROM events e
      JOIN registrations r ON e.id = r.event_id
      WHERE r.user_id = ?
    `).all(userId);
    res.json(registrations);
  });

  app.get('/api/registrations/event/:eventId', (req, res) => {
    const { eventId } = req.params;
    const students = db.prepare(`
      SELECT u.email, r.name, r.department, r.year, r.roll, r.registered_at FROM users u
      JOIN registrations r ON u.id = r.user_id
      WHERE r.event_id = ?
    `).all(eventId);
    res.json(students);
  });

  app.get('/api/registrations/all', (req, res) => {
    const registrations = db.prepare(`
      SELECT r.*, e.title as event_title, u.email as user_email
      FROM registrations r
      JOIN events e ON r.event_id = e.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.registered_at DESC
    `).all();
    res.json(registrations);
  });

  // Media
  app.post('/api/media', (req, res) => {
    const { event_id, file_path, file_type, category } = req.body;
    db.prepare('INSERT INTO media (event_id, file_path, file_type, category) VALUES (?, ?, ?, ?)').run(event_id, file_path, file_type, category || 'gallery');
    res.json({ success: true });
  });

  app.get('/api/media/:eventId', (req, res) => {
    const { eventId } = req.params;
    const media = db.prepare('SELECT * FROM media WHERE event_id = ?').all(eventId);
    res.json(media);
  });

  // --- Vite Middleware ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
