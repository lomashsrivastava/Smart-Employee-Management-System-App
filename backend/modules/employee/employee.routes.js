import express from 'express';
import { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee } from './employee.controller.js';
import { protect, authorize } from '../../middleware/auth.js';

const router = express.Router();

router.route('/')
    .get(protect, getEmployees)
    .post(protect, authorize('ADMIN', 'HR'), createEmployee);

router.route('/:id')
    .get(protect, getEmployeeById)
    .put(protect, authorize('ADMIN', 'HR'), updateEmployee)
    .delete(protect, authorize('ADMIN'), deleteEmployee);

export default router;
