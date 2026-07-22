import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAuthRouter } from './routes/auth.routes.js';
import { createAuthController } from './controllers/auth.controller.js';
import { createAuthService } from './services/auth.service.js';
import { initializeDatabase } from './database/db.js';

// Load environment variables from .env.
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Core middleware.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'client')));

// Initialize the database infrastructure.
initializeDatabase();

// Authentication dependencies will be connected to the SQLite repositories
// in the next database implementation step.
const authService = createAuthService({
  userRepository: {
    async findByUsername() {
      throw new Error('User repository is not connected yet.');
    },
    async create() {
      throw new Error('User repository is not connected yet.');
    }
  },
  sessionRepository: {
    async create() {
      throw new Error('Session repository is not connected yet.');
    },
    async deleteByTokenHash() {
      throw new Error('Session repository is not connected yet.');
    }
  }
});

const authController = createAuthController(authService);

// Health endpoint for development and deployment checks.
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory Management API is running.',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Authentication API.
app.use('/api/auth', createAuthRouter(authController));

// Frontend entry point.
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'client', 'index.html'));
});

// API 404 response.
app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found.'
  });
});

// Generic error handler.
app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
});

app.listen(PORT, () => {
  console.log(`Inventory Management server running on http://localhost:${PORT}`);
});
