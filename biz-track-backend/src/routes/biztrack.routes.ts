import { Router } from 'express';
import {
  getSettings,
  updateSettings,
  getOrders,
  createOrder,
  updateOrder,
  toggleOrderStatus,
  deleteOrder,
  getTransactions,
  createTransaction,
  deleteTransaction,
  getStats,
  exportData,
  resetData,
} from '../controllers/biztrack.controller';

const router = Router();

// Stats
router.get('/stats', getStats);

// Settings
router.get('/settings', getSettings);
router.put('/settings', updateSettings);

// Orders
router.get('/orders', getOrders);
router.post('/orders', createOrder);
router.put('/orders/:id', updateOrder);
router.patch('/orders/:id/status', toggleOrderStatus);
router.delete('/orders/:id', deleteOrder);

// Transactions
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.delete('/transactions/:id', deleteTransaction);

// Backup & Reset
router.get('/export', exportData);
router.post('/reset', resetData);

export default router;
