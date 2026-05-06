import express from 'express';
import { getAllPayrolls, generatePayroll } from './payroll.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllPayrolls);
router.post('/generate', protect, authorize('ADMIN', 'HR'), generatePayroll);

export default router;
