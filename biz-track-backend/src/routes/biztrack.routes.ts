import { Router } from 'express';
import multer from 'multer';
import {
  getSettings,
  updateSettings,
  getOrders,
  createOrder,
  updateOrder,
  toggleOrderStatus,
  completeDelivery,
  uploadImage,
  deleteOrder,
  getTransactions,
  createTransaction,
  deleteTransaction,
  getStats,
  exportData,
  resetData,
} from '../controllers/biztrack.controller';

const router = Router();

import { R2Service } from '../services/r2.service';

// Multer memory storage for direct streaming to Cloudflare R2
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25 MB max
});

// Stream image from Cloudflare R2
router.get('/r2/:key(*)', async (req, res) => {
  try {
    const key = req.params.key;
    const obj = await R2Service.getObject(key);
    if (!obj || !obj.stream) {
      return res.status(404).json({ success: false, message: 'Image not found' });
    }
    res.setHeader('Content-Type', obj.contentType);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    obj.stream.pipe(res);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

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
router.post('/orders/:id/deliver', upload.single('image'), completeDelivery);
router.delete('/orders/:id', deleteOrder);

// Uploads
router.post('/upload', upload.single('image'), uploadImage);

// Transactions
router.get('/transactions', getTransactions);
router.post('/transactions', createTransaction);
router.delete('/transactions/:id', deleteTransaction);

// Backup & Reset
router.get('/export', exportData);
router.post('/reset', resetData);

export default router;
