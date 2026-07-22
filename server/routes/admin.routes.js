import { Router } from 'express';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/admin.middleware.js';

export function createAdminRouter({ sessionRepository, userController }) {
  const router = Router();
  const adminAuth = [requireAuth(sessionRepository), requireAdmin];

  router.get('/users', ...adminAuth, userController.listUsers);
  router.patch('/users/:id/role', ...adminAuth, userController.updateUserRole);
  router.patch('/users/:id/status', ...adminAuth, userController.updateUserStatus);

  return router;
}
