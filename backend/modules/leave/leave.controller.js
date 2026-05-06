import Leave from './leave.model.js';
import Employee from '../employee/employee.model.js';

// @desc    Get all leave requests
// @route   GET /api/v1/leave
// @access  Private
export const getAllLeaves = async (req, res, next) => {
    try {
        let filter = {};
        if (req.user.role === 'EMPLOYEE') {
            const emp = await Employee.findOne({ userId: req.user._id });
            if (!emp) return res.status(404).json({ message: 'Employee profile not found' });
            filter = { employeeId: emp._id };
        }

        const leaves = await Leave.find(filter).populate('employeeId', 'firstName lastName department');
        res.json(leaves);
    } catch (error) {
        next(error);
    }
};

// @desc    Apply for leave
// @route   POST /api/v1/leave
// @access  Private (Employee)
export const applyLeave = async (req, res, next) => {
    try {
        const emp = await Employee.findOne({ userId: req.user._id });
        if (!emp) return res.status(404).json({ message: 'Employee profile not found' });

        const { type, startDate, endDate, reason } = req.body;

        const leave = await Leave.create({
            employeeId: emp._id,
            type,
            startDate,
            endDate,
            reason
        });

        res.status(201).json(leave);
    } catch (error) {
        next(error);
    }
};

// @desc    Update leave status (Approve/Reject)
// @route   PUT /api/v1/leave/:id/status
// @access  Private (Admin/HR)
export const updateLeaveStatus = async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['APPROVED', 'REJECTED'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const leave = await Leave.findById(req.params.id);
        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        leave.status = status;
        leave.approvedBy = req.user._id;
        await leave.save();

        // Update employee status if approved
        if (status === 'APPROVED') {
            await Employee.findByIdAndUpdate(leave.employeeId, { employmentStatus: 'ON_LEAVE' });
        }

        res.json(leave);
    } catch (error) {
        next(error);
    }
};
