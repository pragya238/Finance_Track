const { registerUser, loginUser } = require('../services/authService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * POST /api/auth/register
 * Register a new user
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    const result = await registerUser({ name, email, password, role });
    return sendSuccess(res, 201, 'User registered successfully', result);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login
 * Login and receive a JWT
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await loginUser({ email, password });
    return sendSuccess(res, 200, 'Login successful', result);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me
 * Get currently authenticated user's profile
 */
const getMe = async (req, res) => {
  // req.user is set by the protect middleware
  return sendSuccess(res, 200, 'User profile retrieved', { user: req.user });
};

module.exports = { register, login, getMe };
