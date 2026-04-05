const { getDashboardSummary, getInsights } = require('../services/dashboardService');
const { sendSuccess } = require('../utils/responseHelper');

/**
 * GET /api/dashboard
 * Returns dashboard summary: totals, category breakdown, recent transactions
 * Access: All authenticated users (viewer, analyst, admin)
 */
const getDashboard = async (req, res, next) => {
  try {
    const data = await getDashboardSummary(req.user._id);
    return sendSuccess(res, 200, 'Dashboard data retrieved', data);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/dashboard/insights
 * Returns deeper analytics: top categories, trends
 * Access: Analyst and Admin only
 */
const getDashboardInsights = async (req, res, next) => {
  try {
    const insights = await getInsights(req.user._id);
    return sendSuccess(res, 200, 'Insights retrieved', insights);
  } catch (error) {
    next(error);
  }
};

module.exports = { getDashboard, getDashboardInsights };
