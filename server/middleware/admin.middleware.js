import { requireRole } from './role.middleware.js';

export const requireAdmin = requireRole('Admin');
