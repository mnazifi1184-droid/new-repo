export function createSessionRepository(db) {
  return {
    create({ userId, tokenHash, expiresAt }) {
      return db.prepare(`
        INSERT INTO sessions (user_id, token_hash, expires_at)
        VALUES (?, ?, ?)
      `).run(userId, tokenHash, expiresAt);
    },

    findByTokenHash(tokenHash) {
      return db.prepare(`
        SELECT
          s.id,
          s.user_id,
          s.token_hash,
          s.expires_at,
          s.created_at,
          u.id AS user_id,
          u.full_name,
          u.username,
          u.role,
          u.is_active
        FROM sessions s
        INNER JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?
        LIMIT 1
      `).get(tokenHash);
    },

    deleteByTokenHash(tokenHash) {
      return db.prepare(`
        DELETE FROM sessions
        WHERE token_hash = ?
      `).run(tokenHash);
    },

    deleteExpired() {
      return db.prepare(`
        DELETE FROM sessions
        WHERE expires_at <= datetime('now')
      `).run();
    }
  };
}
