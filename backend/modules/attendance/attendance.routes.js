import express from 'express';
import { getAllAttendance, checkIn, checkOut, adminMarkAttendance, deleteAttendance } from './attendance.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.get('/', protect, getAllAttendance);
router.post('/check-in', protect, authorize('EMPLOYEE'), checkIn);
router.post('/check-out', protect, authorize('EMPLOYEE'), checkOut);

// Admin Routes
router.post('/admin-mark', protect, authorize('ADMIN', 'HR'), adminMarkAttendance);
router.delete('/:id', protect, authorize('ADMIN'), deleteAttendance);

export default router;
