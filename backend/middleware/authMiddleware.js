const User = require('../models/User');
const { verifyToken } = require('../utils/jwtHelper');
const { sendError } = require('../utils/responseHelper');

/**
 * MIDDLEWARE: protect
 * Verifies JWT token and attaches authenticated user to req.user
 */
const protect = async (req, res, next) => {
  try {
    // 1. Extract token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 401, 'Access denied. No token provided.');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = verifyToken(token);

    // 3. Find user in DB (ensures user still exists and is active)
    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return sendError(res, 401, 'User not found or account deactivated.');
    }

    // 4. Attach user to request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 401, 'Token has expired. Please login again.');
    }
    return sendError(res, 401, 'Invalid token.');
  }
};

/**
 * MIDDLEWARE: authorize
 * Restricts access to specific roles.
 * Usage: authorize('admin') or authorize('admin', 'analyst')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return sendError(
        res,
        403,
        `Access denied. Role '${req.user.role}' is not authorized for this action.`
      );
    }
    next();
  };
};

module.exports = { protect, authorize };
