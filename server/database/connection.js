import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Database from 'better-sqlite3';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDirectory = path.join(__dirname, 'data');
const databasePath = path.join(dataDirectory, 'inventory.db');
const schemaPath = path.join(__dirname, 'schema.sql');

export function createDatabase() {
  fs.mkdirSync(dataDirectory, { recursive: true });

  const db = new Database(databasePath);
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');

  const schema = fs.readFileSync(schemaPath, 'utf8');
  db.exec(schema);

  return db;
}

export { databasePath };
