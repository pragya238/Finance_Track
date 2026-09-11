const jwt = require('jsonwebtoken');

const getSecret = () => {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('JWT_SECRET must be set to a random value of at least 32 characters.');
  }
  return process.env.JWT_SECRET;
};

const generateToken = (userId) => jwt.sign(
  { id: String(userId) },
  getSecret(),
  { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
);

const verifyToken = (token) => jwt.verify(token, getSecret());

module.exports = { generateToken, verifyToken };
