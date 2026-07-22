import { hashPassword, verifyPassword } from './password.service.js';
import {
  createSessionToken,
  getSessionExpiration,
  hashSessionToken
} from './session.service.js';

export function createAuthService({ userRepository, sessionRepository }) {
  return {
    async signup({ fullName, username, password }) {
      const normalizedUsername = username.trim().toLowerCase();
      const normalizedFullName = fullName.trim();

      if (!normalizedFullName || !normalizedUsername || !password) {
        throw new Error('Full name, username, and password are required.');
      }

      if (password.length < 8) {
        throw new Error('Password must contain at least 8 characters.');
      }

      const existingUser = await userRepository.findByUsername(normalizedUsername);

      if (existingUser) {
        throw new Error('Username is already registered.');
      }

      const user = await userRepository.create({
        fullName: normalizedFullName,
        username: normalizedUsername,
        passwordHash: hashPassword(password),
        role: 'User'
      });

      return sanitizeUser(user);
    },

    async login({ username, password }) {
      const normalizedUsername = username.trim().toLowerCase();
      const user = await userRepository.findByUsername(normalizedUsername);

      if (!user || !user.is_active || !verifyPassword(password, user.password_hash)) {
        throw new Error('Invalid username or password.');
      }

      const token = createSessionToken();
      const expiresAt = getSessionExpiration();

      await sessionRepository.create({
        userId: user.id,
        tokenHash: hashSessionToken(token),
        expiresAt
      });

      return {
        user: sanitizeUser(user),
        session: {
          token,
          expiresAt
        }
      };
    },

    async logout(token) {
      await sessionRepository.deleteByTokenHash(hashSessionToken(token));
    }
  };
}

function sanitizeUser(user) {
  return {
    id: user.id,
    fullName: user.full_name,
    username: user.username,
    role: user.role,
    isActive: Boolean(user.is_active)
  };
}
