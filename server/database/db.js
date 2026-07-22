import { createDatabase, databasePath } from './connection.js';

export function initializeDatabase() {
  const db = createDatabase();
  console.log(`SQLite database initialized at ${databasePath}`);
  return db;
}
