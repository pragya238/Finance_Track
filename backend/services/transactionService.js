const Transaction = require('../models/Transaction');

const createTransaction = async (userId, transactionData) => {
  return Transaction.create({ user: userId, ...transactionData });
};

const getTransactions = async (userId, filters = {}) => {
  const query = { user: userId };

  if (filters.type) query.type = filters.type;
  if (filters.category) query.category = filters.category;

  if (filters.startDate || filters.endDate) {
    query.date = {};
    if (filters.startDate) query.date.$gte = new Date(`${filters.startDate}T00:00:00.000Z`);
    if (filters.endDate) query.date.$lte = new Date(`${filters.endDate}T23:59:59.999Z`);
  }

  const limit = Math.min(Math.max(parseInt(filters.limit, 10) || 100, 1), 200);
  return Transaction.find(query).sort({ date: -1 }).limit(limit);
};

const getTransactionById = async (transactionId, userId) => {
  return Transaction.findOne({ _id: transactionId, user: userId });
};

const updateTransaction = async (transactionId, userId, updateData) => {
  return Transaction.findOneAndUpdate(
    { _id: transactionId, user: userId },
    updateData,
    { new: true, runValidators: true }
  );
};

const deleteTransaction = async (transactionId, userId) => {
  return Transaction.findOneAndDelete({ _id: transactionId, user: userId });
};

module.exports = {
  createTransaction,
  getTransactions,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
