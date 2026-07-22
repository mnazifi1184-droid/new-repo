export function createUserController({ userRepository }) {
  return {
    listUsers: async (req, res, next) => {
      try {
        const users = userRepository.findAll();

        res.json({
          success: true,
          users: users.map((user) => ({
            id: user.id,
            fullName: user.full_name,
            username: user.username,
            role: user.role,
            isActive: Boolean(user.is_active),
            createdAt: user.created_at
          }))
        });
      } catch (error) {
        next(error);
      }
    },

    updateUserRole: async (req, res, next) => {
      try {
        const userId = Number(req.params.id);
        const { role } = req.body;
        const allowedRoles = ['Admin', 'Editor', 'User'];

        if (!Number.isInteger(userId) || !allowedRoles.includes(role)) {
          return res.status(400).json({
            success: false,
            message: 'Invalid user ID or role.'
          });
        }

        const user = userRepository.updateRole(userId, role);

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found.'
          });
        }

        res.json({
          success: true,
          message: 'User role updated successfully.',
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
    },

    updateUserStatus: async (req, res, next) => {
      try {
        const userId = Number(req.params.id);
        const { isActive } = req.body;

        if (!Number.isInteger(userId) || typeof isActive !== 'boolean') {
          return res.status(400).json({
            success: false,
            message: 'Invalid user ID or status.'
          });
        }

        const user = userRepository.updateStatus(userId, isActive);

        if (!user) {
          return res.status(404).json({
            success: false,
            message: 'User not found.'
          });
        }

        res.json({
          success: true,
          message: 'User status updated successfully.',
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
    }
  };
}
