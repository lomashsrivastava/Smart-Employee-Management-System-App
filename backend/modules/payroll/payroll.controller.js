import Payroll from './payroll.model.js';
import Employee from '../employee/employee.model.js';
import { payrollQueue } from '../../config/redis.js';

// @desc    Get all payrolls
// @route   GET /api/v1/payroll
// @access  Private
export const getAllPayrolls = async (req, res, next) => {
    try {
        let filter = {};
        if (req.user.role === 'EMPLOYEE') {
            const emp = await Employee.findOne({ userId: req.user._id });
            if (!emp) return res.status(404).json({ message: 'Employee profile not found' });
            filter = { employeeId: emp._id };
        }

        const payrolls = await Payroll.find(filter).populate('employeeId', 'firstName lastName department email');
        res.json(payrolls);
    } catch (error) {
        next(error);
    }
};

// @desc    Generate payroll for a month
// @route   POST /api/v1/payroll/generate
// @access  Private (Admin/HR)
export const generatePayroll = async (req, res, next) => {
    try {
        const { month, year } = req.body;
        
        // Find all active employees
        const employees = await Employee.find({ employmentStatus: 'ACTIVE', isDeleted: false });
        
        const payrollsToInsert = [];
        
        for (const emp of employees) {
            // Check if payroll already exists for this month/year
            const existing = await Payroll.findOne({ employeeId: emp._id, month, year });
            if (!existing) {
                const netSalary = emp.basicSalary + emp.allowances - emp.deductions;
                payrollsToInsert.push({
                    employeeId: emp._id,
                    month,
                    year,
                    basicSalary: emp.basicSalary,
                    allowances: emp.allowances,
                    deductions: emp.deductions,
                    netSalary,
                    status: 'PROCESSED'
                });
            }
        }

        if (payrollsToInsert.length > 0) {
            await Payroll.insertMany(payrollsToInsert);
            
            // Add job to BullMQ queue for email notifications or PDF generation
            await payrollQueue.add('generate-pdfs', { month, year });
        }

        res.status(201).json({ message: `Generated ${payrollsToInsert.length} payslips for ${month}/${year}` });
    } catch (error) {
        next(error);
    }
};
