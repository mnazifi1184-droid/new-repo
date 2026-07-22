import express from 'express';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Load environment variables from .env
// This replaces configuration that was previously handled by Apps Script deployment settings.
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Core middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve the frontend as static files.
app.use(express.static(path.join(rootDir, 'client')));

// Health endpoint for development and deployment checks.
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory Management API is running.',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Frontend entry point.
app.get('/', (req, res) => {
  res.sendFile(path.join(rootDir, 'client', 'index.html'));
});

// Temporary 404 response. API routes will be added in later commits.
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
    message: 'Internal server error.'
  });
});

app.listen(PORT, () => {
  console.log(`Inventory Management server running on http://localhost:${PORT}`);
});
