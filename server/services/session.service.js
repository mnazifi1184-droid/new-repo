import crypto from 'node:crypto';

const SESSION_DURATION_MS = 1000 * 60 * 60 * 8;

export function createSessionToken() {
  return crypto.randomBytes(48).toString('hex');
}

export function hashSessionToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function getSessionExpiration() {
  return new Date(Date.now() + SESSION_DURATION_MS).toISOString();
}

export function isSessionExpired(expiresAt) {
  return new Date(expiresAt).getTime() <= Date.now();
}
