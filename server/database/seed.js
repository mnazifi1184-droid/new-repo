import { createDatabase } from './connection.js';
import { createUserRepository } from './repositories/user.repository.js';
import { hashPassword } from '../services/password.service.js';

const db = createDatabase();
const userRepository = createUserRepository(db);

const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD;
const adminFullName = process.env.ADMIN_FULL_NAME || 'System Administrator';

if (!adminPassword) {
  console.error('ADMIN_PASSWORD is required to seed the admin user.');
  process.exit(1);
}

const existingAdmin = userRepository.findByUsername(adminUsername.toLowerCase());

if (existingAdmin) {
  console.log(`Admin user "${adminUsername}" already exists.`);
  db.close();
  process.exit(0);
}

userRepository.create({
  fullName: adminFullName,
  username: adminUsername.toLowerCase(),
  passwordHash: hashPassword(adminPassword),
  role: 'Admin'
});

console.log(`Admin user "${adminUsername}" created successfully.`);
db.close();
