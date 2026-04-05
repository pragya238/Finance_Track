const transactionService = require('../services/transactionService');
const { sendSuccess, sendError } = require('../utils/responseHelper');

/**
 * POST /api/transactions
 * Create a new transaction (Analyst + Admin only)
 */
const createTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.createTransaction(
      req.user._id,
      req.body
    );
    return sendSuccess(res, 201, 'Transaction created successfully', { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions
 * Get all transactions for the authenticated user (all roles)
 * Query params: type, category, startDate, endDate, limit
 */
const getTransactions = async (req, res, next) => {
  try {
    const filters = {
      type: req.query.type,
      category: req.query.category,
      startDate: req.query.startDate,
      endDate: req.query.endDate,
      limit: req.query.limit,
    };

    const transactions = await transactionService.getTransactions(
      req.user._id,
      filters
    );

    return sendSuccess(res, 200, 'Transactions retrieved', {
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/transactions/:id
 * Get a single transaction by ID
 */
const getTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.getTransactionById(
      req.params.id,
      req.user._id
    );

    if (!transaction) {
      return sendError(res, 404, 'Transaction not found');
    }

    return sendSuccess(res, 200, 'Transaction retrieved', { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/transactions/:id
 * Update a transaction (Analyst + Admin only)
 */
const updateTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.updateTransaction(
      req.params.id,
      req.user._id,
      req.body
    );

    if (!transaction) {
      return sendError(res, 404, 'Transaction not found');
    }

    return sendSuccess(res, 200, 'Transaction updated successfully', { transaction });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/transactions/:id
 * Delete a transaction (Admin only)
 */
const deleteTransaction = async (req, res, next) => {
  try {
    const transaction = await transactionService.deleteTransaction(
      req.params.id,
      req.user._id
    );

    if (!transaction) {
      return sendError(res, 404, 'Transaction not found');
    }

    return sendSuccess(res, 200, 'Transaction deleted successfully', {});
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
};
