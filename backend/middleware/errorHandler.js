const { sendError } = require('../utils/responseHelper');

/**
 * Global error handling middleware.
 * Must have 4 arguments to be recognized by Express as error handler.
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return sendError(res, 422, 'Validation Error', messages);
  }

  // Mongoose duplicate key error (e.g., duplicate email)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return sendError(res, 409, `${field} already exists.`);
  }

  // Mongoose invalid ObjectId
  if (err.name === 'CastError') {
    return sendError(res, 400, `Invalid ${err.path}: ${err.value}`);
  }

  // Default server error
  return sendError(res, err.statusCode || 500, err.message || 'Internal Server Error');
};

module.exports = errorHandler;
