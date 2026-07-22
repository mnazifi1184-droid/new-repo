export function createAuthController(authService) {
  return {
    signup: async (req, res, next) => {
      try {
        const user = await authService.signup(req.body);

        res.status(201).json({
          success: true,
          message: 'Account created successfully.',
          user
        });
      } catch (error) {
        next(error);
      }
    },

    login: async (req, res, next) => {
      try {
        const result = await authService.login(req.body);

        res.json({
          success: true,
          message: 'Login successful.',
          ...result
        });
      } catch (error) {
        res.status(401).json({
          success: false,
          message: error.message
        });
      }
    },

    logout: async (req, res, next) => {
      try {
        const authorization = req.headers.authorization || '';
        const [, token] = authorization.split(' ');

        if (token) {
          await authService.logout(token);
        }

        res.json({
          success: true,
          message: 'Logged out successfully.'
        });
      } catch (error) {
        next(error);
      }
    }
  };
}
