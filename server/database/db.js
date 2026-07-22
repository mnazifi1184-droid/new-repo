import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, 'data');

/**
 * Database adapter placeholder.
 *
 * The schema is prepared in schema.sql. The actual SQLite driver will be
 * introduced in the next database-focused commit so authentication logic
 * remains separated from infrastructure concerns.
 */
export function getDatabasePath() {
  fs.mkdirSync(dataDirectory, { recursive: true });
  return path.join(dataDirectory, 'inventory.db');
}

export function initializeDatabase() {
  const databasePath = getDatabasePath();
  console.log(`Database path: ${databasePath}`);
  return databasePath;
}
