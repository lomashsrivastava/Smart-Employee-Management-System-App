import Employee from '../employee/employee.model.js';
import Attendance from '../attendance/attendance.model.js';
import Leave from '../leave/leave.model.js';

// @desc    Get dashboard metrics
// @route   GET /api/v1/analytics/dashboard
// @access  Private (Admin/HR)
export const getDashboardMetrics = async (req, res, next) => {
    try {
        const totalEmployees = await Employee.countDocuments({ isDeleted: false });
        
        // Departments count
        const departmentsAgg = await Employee.aggregate([
            { $match: { isDeleted: false } },
            { $group: { _id: "$department" } }
        ]);
        const totalDepartments = departmentsAgg.length;

        // Today's attendance
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayAttendance = await Attendance.countDocuments({ date: { $gte: today }, checkIn: { $ne: null } });

        // Pending leaves
        const pendingLeaves = await Leave.countDocuments({ status: 'PENDING' });

        res.json({
            role: req.user.role,
            totalEmployees,
            totalDepartments,
            todayAttendance,
            pendingLeaves
        });
    } catch (error) {
        next(error);
    }
};

// @desc    Get employee specific dashboard metrics
// @route   GET /api/v1/analytics/employee-dashboard
// @access  Private (Employee)
export const getEmployeeDashboardMetrics = async (req, res, next) => {
    try {
        const emp = await Employee.findOne({ userId: req.user._id });
        if (!emp) return res.status(404).json({ message: 'Employee profile not found' });

        const firstDayOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const currentMonthAttendance = await Attendance.countDocuments({ 
            employeeId: emp._id, 
            date: { $gte: firstDayOfMonth },
            checkIn: { $ne: null }
        });

        const pendingLeaves = await Leave.countDocuments({ 
            employeeId: emp._id, 
            status: 'PENDING' 
        });

        res.json({
            currentMonthAttendance,
            pendingLeaves,
            employee: {
                firstName: emp.firstName,
                lastName: emp.lastName,
                position: emp.position,
                department: emp.department
            }
        });
    } catch (error) {
        next(error);
    }
};
