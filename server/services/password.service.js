import crypto from 'node:crypto';

const ITERATIONS = 120_000;
const KEY_LENGTH = 64;
const DIGEST = 'sha512';
const SALT_LENGTH = 32;

export function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 8) {
    throw new Error('Password must contain at least 8 characters.');
  }

  const salt = crypto.randomBytes(SALT_LENGTH).toString('hex');
  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt,
    ITERATIONS,
    KEY_LENGTH,
    DIGEST
  ).toString('hex');

  return `pbkdf2$${ITERATIONS}$${salt}$${derivedKey}`;
}

export function verifyPassword(password, storedHash) {
  if (typeof password !== 'string' || typeof storedHash !== 'string') {
    return false;
  }

  const [algorithm, iterations, salt, storedKey] = storedHash.split('$');

  if (algorithm !== 'pbkdf2' || !iterations || !salt || !storedKey) {
    return false;
  }

  const derivedKey = crypto.pbkdf2Sync(
    password,
    salt,
    Number(iterations),
    KEY_LENGTH,
    DIGEST
  ).toString('hex');

  return crypto.timingSafeEqual(
    Buffer.from(derivedKey, 'hex'),
    Buffer.from(storedKey, 'hex')
  );
}
