const express = require('express');
const router = express.Router();
const {
  createTransaction,
  getTransactions,
  getTransaction,
  updateTransaction,
  deleteTransaction,
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateTransaction } = require('../middleware/validationMiddleware');

// All routes below require authentication
router.use(protect);

// GET  /api/transactions         → All roles can view
// POST /api/transactions         → Analyst + Admin only
router
  .route('/')
  .get(getTransactions)
  .post(authorize('analyst', 'admin'), validateTransaction, createTransaction);

// GET    /api/transactions/:id   → All roles
// PUT    /api/transactions/:id   → Analyst + Admin only
// DELETE /api/transactions/:id   → Admin only
router
  .route('/:id')
  .get(getTransaction)
  .put(authorize('analyst', 'admin'), validateTransaction, updateTransaction)
  .delete(authorize('admin'), deleteTransaction);

module.exports = router;
