const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');

/**
 * Register a new user
 */
const registerUser = async ({ name, email, password, role }) => {
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  // Create user (password hashing handled in model pre-save hook)
  const user = await User.create({ name, email, password, role });

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

/**
 * Login an existing user
 */
const loginUser = async ({ email, password }) => {
  // Find user and explicitly include password for comparison
  const user = await User.findOne({ email }).select('+password');
  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  // Verify password
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user._id);

  return {
    token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = { registerUser, loginUser };
