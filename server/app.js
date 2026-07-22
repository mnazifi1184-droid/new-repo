import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createAuthRouter } from './routes/auth.routes.js';
import { createAuthController } from './controllers/auth.controller.js';
import { createAuthService } from './services/auth.service.js';
import { initializeDatabase } from './database/db.js';
import { createUserRepository } from './database/repositories/user.repository.js';
import { createSessionRepository } from './database/repositories/session.repository.js';
import { createUserRouter } from './routes/user.routes.js';
import { createAdminRouter } from './routes/admin.routes.js';
import { createUserController } from './controllers/user.controller.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, 'client')));

const db = initializeDatabase();
const userRepository = createUserRepository(db);
const sessionRepository = createSessionRepository(db);

const authService = createAuthService({
  userRepository,
  sessionRepository
});

const authController = createAuthController(authService);
const userController = createUserController({ userRepository });

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory Management API is running.',
    environment: process.env.NODE_ENV || 'development'
  });
});

app.use('/api/auth', createAuthRouter(authController));

app.use('/api/users', createUserRouter({
  sessionRepository,
  userRepository
}));

app.use('/api/admin', createAdminRouter({
  sessionRepository,
  userController
}));

app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'client', 'index.html'));
});

app.use('/api', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found.'
  });
});

app.use((err, req, res, next) => {
  console.error(err);

  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error.'
  });
});

const server = app.listen(PORT, () => {
  console.log(`Inventory Management server running on http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} received. Shutting down gracefully...`);

  server.close(() => {
    db.close();
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
