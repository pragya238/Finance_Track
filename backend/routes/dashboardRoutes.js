const express = require('express');
const router = express.Router();
const { getDashboard, getDashboardInsights } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

// GET /api/dashboard          → All authenticated users
router.get('/', protect, getDashboard);

// GET /api/dashboard/insights → Analyst + Admin only
router.get('/insights', protect, authorize('analyst', 'admin'), getDashboardInsights);

module.exports = router;
