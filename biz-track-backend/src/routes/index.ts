import { Router } from 'express';
import healthRoutes from './health.routes';
import biztrackRoutes from './biztrack.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/', biztrackRoutes);

export default router;
