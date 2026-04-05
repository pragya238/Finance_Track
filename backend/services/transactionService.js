const Transaction = require('../models/Transaction');

/**
 * Create a new transaction
 */
const createTransaction = async (userId, transactionData) => {
  const transaction = await Transaction.create({
    user: userId,
    ...transactionData,
  });
  return transaction;
};

/**
 * Get all transactions for a user with optional filters
 * Supports: type, category, startDate, endDate
 */
const getTransactions = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(filters.startDate);
    if (filters.endDate) query.date.$lte = new Date(filters.endDate);
  }

  const transactions = await Transaction.find(query)
    .sort({ date: -1 }) // Most recent first
    .limit(filters.limit ? parseInt(filters.limit) : 100);

  return transactions;
};

/**
 * Get a single transaction by ID (and verify ownership)
 */
const getTransactionById = async (transactionId, userId) => {
  const transaction = await Transaction.findOne({
    _id: transactionId,
    user: userId,
  });
  return transaction;
};

/**
 * Update a transaction
 */
const updateTransaction = async (transactionId, userId, updateData) => {
  const transaction = await Transaction.findOneAndUpdate(
    { _id: transactionId, user: userId },
    updateData,
    { new: true, runValidators: true } // Return updated doc, run validators
  );
  return transaction;
};

/**
 * Delete a transaction
 */
const deleteTransaction = async (transactionId, userId) => {
  const transaction = await Transaction.findOneAndDelete({
    _id: transactionId,
    user: userId,
  });
  return transaction;
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
