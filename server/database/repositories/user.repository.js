export function createUserRepository(db) {
  return {
    findByUsername(username) {
      return db.prepare(`
        SELECT id, full_name, username, password_hash, role, is_active, created_at, updated_at
        FROM users
        WHERE username = ?
        LIMIT 1
      `).get(username);
    },

    create({ fullName, username, passwordHash, role = 'User' }) {
      const result = db.prepare(`
        INSERT INTO users (full_name, username, password_hash, role)
        VALUES (?, ?, ?, ?)
      `).run(fullName, username, passwordHash, role);

      return db.prepare(`
        SELECT id, full_name, username, password_hash, role, is_active, created_at, updated_at
        FROM users
        WHERE id = ?
      `).get(result.lastInsertRowid);
    },

    findById(id) {
      return db.prepare(`
        SELECT id, full_name, username, role, is_active, created_at, updated_at
        FROM users
        WHERE id = ?
        LIMIT 1
      `).get(id);
    },

    findAll() {
      return db.prepare(`
        SELECT id, full_name, username, role, is_active, created_at, updated_at
        FROM users
        ORDER BY created_at DESC, id DESC
      `).all();
    },

    updateRole(id, role) {
      db.prepare(`
        UPDATE users
        SET role = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(role, id);

      return this.findById(id);
    },

    updateStatus(id, isActive) {
      db.prepare(`
        UPDATE users
        SET is_active = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(isActive ? 1 : 0, id);

      return this.findById(id);
    }
  };
}
