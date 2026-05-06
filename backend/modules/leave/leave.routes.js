import express from 'express';
import { getAllLeaves, applyLeave, updateLeaveStatus } from './leave.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, getAllLeaves)
    .post(protect, authorize('EMPLOYEE'), applyLeave);

router.put('/:id/status', protect, authorize('ADMIN', 'HR'), updateLeaveStatus);

export default router;
