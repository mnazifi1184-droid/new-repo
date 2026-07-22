import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';

export function createUserRouter({ sessionRepository, userRepository }) {
  const router = Router();
  const auth = requireAuth(sessionRepository);

  router.get('/me', auth, async (req, res, next) => {
    try {
      const user = userRepository.findById(req.user.user_id);

      if (!user || !user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'User account is unavailable.'
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          fullName: user.full_name,
          username: user.username,
          role: user.role,
          isActive: Boolean(user.is_active)
        }
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
}
