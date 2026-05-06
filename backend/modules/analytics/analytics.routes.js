import express from 'express';
import { getDashboardMetrics, getEmployeeDashboardMetrics } from './analytics.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.get('/dashboard', protect, authorize('ADMIN', 'HR'), getDashboardMetrics);
router.get('/employee-dashboard', protect, authorize('EMPLOYEE'), getEmployeeDashboardMetrics);

export default router;
