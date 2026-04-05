const Transaction = require('../models/Transaction');

/**
 * Get full dashboard summary for a user:
 * - Total income, total expenses, net balance
 * - Category-wise totals
 * - Recent 5 transactions
 */
const getDashboardSummary = async (userId) => {
  // ─── 1. Aggregate totals by type ─────────────────────────
  const typeTotals = await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: '$type',
        total: { $sum: '$amount' },
      },
    },
  ]);

  const totalIncome = typeTotals.find((t) => t._id === 'income')?.total || 0;
  const totalExpenses = typeTotals.find((t) => t._id === 'expense')?.total || 0;
  const netBalance = totalIncome - totalExpenses;

  // ─── 2. Aggregate totals by category ─────────────────────
  const categoryTotals = await Transaction.aggregate([
    { $match: { user: userId } },
    {
      $group: {
        _id: { category: '$category', type: '$type' },
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    {
      $project: {
        _id: 0,
        category: '$_id.category',
        type: '$_id.type',
        total: 1,
        count: 1,
      },
    },
    { $sort: { total: -1 } },
  ]);

  // ─── 3. Recent transactions (last 5) ─────────────────────
  const recentTransactions = await Transaction.find({ user: userId })
    .sort({ date: -1 })
    .limit(5)
    .select('amount type category description date');

  // ─── 4. Monthly trend (last 6 months) ────────────────────
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTrend = await Transaction.aggregate([
    {
      $match: {
        user: userId,
        date: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$date' },
          month: { $month: '$date' },
          type: '$type',
        },
        total: { $sum: '$amount' },
      },
    },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        type: '$_id.type',
        total: 1,
      },
    },
    { $sort: { year: 1, month: 1 } },
  ]);

  return {
    summary: {
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      netBalance: parseFloat(netBalance.toFixed(2)),
    },
    categoryTotals,
    recentTransactions,
    monthlyTrend,
  };
};

/**
 * Analyst-only: Get insights (top spending categories, income vs expense ratio)
 */
const getInsights = async (userId) => {
  const topExpenseCategories = await Transaction.aggregate([
    { $match: { user: userId, type: 'expense' } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, category: '$_id', total: 1 } },
  ]);

  const topIncomeCategories = await Transaction.aggregate([
    { $match: { user: userId, type: 'income' } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, category: '$_id', total: 1 } },
  ]);

  return { topExpenseCategories, topIncomeCategories };
};

module.exports = { getDashboardSummary, getInsights };
