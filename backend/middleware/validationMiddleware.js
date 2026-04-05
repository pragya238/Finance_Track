const { body, query, validationResult } = require('express-validator');
const { sendError } = require('../utils/responseHelper');

/**
 * Runs after validator chains — extracts errors and returns 422 if any
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return sendError(res, 422, 'Validation failed', errors.array());
  }
  next();
};

// ─── Auth Validators ──────────────────────────────────────────
const validateRegister = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role')
    .optional()
    .isIn(['viewer', 'analyst', 'admin'])
    .withMessage('Role must be viewer, analyst, or admin'),
  handleValidationErrors,
];

const validateLogin = [
  body('email').isEmail().withMessage('Please provide a valid email').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

// ─── Transaction Validators ───────────────────────────────────
const VALID_CATEGORIES = [
  'salary', 'freelance', 'investment', 'gift', 'other_income',
  'food', 'transport', 'housing', 'utilities', 'healthcare',
  'entertainment', 'shopping', 'education', 'travel', 'other_expense',
];

const validateTransaction = [
  body('amount')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be a positive number'),
  body('type')
    .isIn(['income', 'expense'])
    .withMessage('Type must be income or expense'),
  body('category')
    .isIn(VALID_CATEGORIES)
    .withMessage(`Category must be one of: ${VALID_CATEGORIES.join(', ')}`),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO 8601 date'),
  body('description')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Description cannot exceed 200 characters'),
  handleValidationErrors,
];

module.exports = { validateRegister, validateLogin, validateTransaction };
