import { Router } from 'express';
import {
  getMetrics,
  getOrders,
  getMonthlyRevenue,
  getFullOverview,
} from '../controllers/overview.controller';

const router = Router();

router.get('/', getFullOverview);
router.get('/metrics', getMetrics);
router.get('/orders', getOrders);
router.get('/revenue', getMonthlyRevenue);

export default router;
