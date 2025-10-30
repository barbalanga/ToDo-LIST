const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const todoRoutes = require('./routes/todos');
const listsRoutes = require('./routes/lists');
const listTodosRoutes = require('./routes/listTodos');
const requireAuth = require('./middleware/auth');

const app = express();

// ===== CORS settings =====
const corsOptions = {
  origin: [
    'https://deluxe-axolotl-432a86.netlify.app',
    'http://localhost:4200'
  ],
  methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // handle preflight
// ==========================

app.use(express.json());

// Simple health check route
app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/auth', authRoutes);
app.use('/', todoRoutes);
app.use('/lists', requireAuth, listsRoutes);
app.use('/', requireAuth, listTodosRoutes);

// DB connection and server start
const port = process.env.PORT || 4000;
const mongoUri = process.env.DB_URI;

if (!mongoUri) {
  console.error('Missing DB_URI in .env');
  process.exit(1);
}

mongoose.connect(mongoUri, {
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS: 45000,
  family: 4,
  tls: true
}).then(() => {
  console.log('Connected to DB');
  app.listen(port, () => console.log(`API listening on :${port}`));
}).catch((err) => {
  console.error('DB connection error', err);
  process.exit(1);
});
