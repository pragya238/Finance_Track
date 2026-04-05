const User = require('../models/User');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * GET /api/users
 * Get all users (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, 200, 'Users retrieved', { count: users.length, users });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/users/:id
 * Get user by ID (Admin only)
 */
const getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return sendError(res, 404, 'User not found');
    return sendSuccess(res, 200, 'User retrieved', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/users/:id
 * Update user role or status (Admin only)
 */
const updateUser = async (req, res, next) => {
  try {
    const { role, isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role, isActive },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) return sendError(res, 404, 'User not found');

    return sendSuccess(res, 200, 'User updated successfully', { user });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/users/:id
 * Delete a user (Admin only)
 */
const deleteUser = async (req, res, next) => {
  try {
    // Prevent admin from deleting themselves
    if (req.params.id === req.user._id.toString()) {
      return sendError(res, 400, 'You cannot delete your own account');
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return sendError(res, 404, 'User not found');

    return sendSuccess(res, 200, 'User deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getUserById, updateUser, deleteUser };
