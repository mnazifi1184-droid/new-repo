import { hashSessionToken, isSessionExpired } from '../services/session.service.js';

/**
 * Authentication middleware.
 *
 * The database lookup is intentionally delegated to the user/session service
 * that will be connected in the next implementation step.
 */
export function requireAuth(sessionRepository) {
  return async (req, res, next) => {
    try {
      const authorization = req.headers.authorization || '';
      const [scheme, token] = authorization.split(' ');

      if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const tokenHash = hashSessionToken(token);
      const session = await sessionRepository.findByTokenHash(tokenHash);

      if (!session || isSessionExpired(session.expires_at)) {
        return res.status(401).json({
          success: false,
          message: 'Session is invalid or expired.'
        });
      }

      req.user = session.user;
      req.session = session;
      next();
    } catch (error) {
      next(error);
    }
  };
}
