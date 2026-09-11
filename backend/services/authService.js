const User = require('../models/User');
const { generateToken } = require('../utils/jwtHelper');

const publicUser = (user) => ({
  id: String(user._id),
  name: user.name,
  email: user.email,
  role: user.role,
});

const registerUser = async ({ name, email, password, role }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    const error = new Error('Email already in use');
    error.statusCode = 409;
    throw error;
  }

  // Public sign-up can create viewer or analyst accounts, never admin accounts.
  const safeRole = role === 'viewer' ? 'viewer' : 'analyst';
  const user = await User.create({
    name: String(name || '').trim(),
    email: normalizedEmail,
    password,
    role: safeRole,
  });

  return { token: generateToken(user._id), user: publicUser(user) };
};

const loginUser = async ({ email, password }) => {
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const user = await User.findOne({ email: normalizedEmail }).select('+password');

  if (!user || !user.isActive) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  return { token: generateToken(user._id), user: publicUser(user) };
};

module.exports = { registerUser, loginUser };
