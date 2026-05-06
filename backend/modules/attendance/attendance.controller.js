import Attendance from './attendance.model.js';
import Employee from '../employee/employee.model.js';
import { io } from '../../server.js'; // Import websocket

// @desc    Get all attendance records
// @route   GET /api/v1/attendance
// @access  Private
export const getAllAttendance = async (req, res, next) => {
    try {
        const query = req.user.role === 'EMPLOYEE' ? { employeeId: req.user.employeeId } : {}; // Wait, need to get employeeId from user
        
        let employeeId;
        if (req.user.role === 'EMPLOYEE') {
            const emp = await Employee.findOne({ userId: req.user._id });
            if (!emp) return res.status(404).json({ message: 'Employee profile not found' });
            employeeId = emp._id;
        }

        const filter = req.user.role === 'EMPLOYEE' ? { employeeId } : {};

        const attendance = await Attendance.find(filter).populate('employeeId', 'firstName lastName department');
        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

// @desc    Check In
// @route   POST /api/v1/attendance/check-in
// @access  Private (Employee)
export const checkIn = async (req, res, next) => {
    try {
        const emp = await Employee.findOne({ userId: req.user._id });
        if (!emp) return res.status(404).json({ message: 'Employee profile not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            employeeId: emp._id,
            date: { $gte: today }
        });

        if (attendance && attendance.checkIn) {
            return res.status(400).json({ message: 'Already checked in today' });
        }

        attendance = await Attendance.create({
            employeeId: emp._id,
            date: today,
            checkIn: new Date(),
            status: 'PRESENT'
        });

        // Emit socket event for real-time dashboard update
        if (io) {
            io.emit('attendance_update', { action: 'check-in', data: attendance });
        }

        res.status(201).json(attendance);
    } catch (error) {
        next(error);
    }
};

// @desc    Check Out
// @route   POST /api/v1/attendance/check-out
// @access  Private (Employee)
export const checkOut = async (req, res, next) => {
    try {
        const emp = await Employee.findOne({ userId: req.user._id });
        if (!emp) return res.status(404).json({ message: 'Employee profile not found' });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            employeeId: emp._id,
            date: { $gte: today }
        });

        if (!attendance || !attendance.checkIn) {
            return res.status(400).json({ message: 'Not checked in today' });
        }

        if (attendance.checkOut) {
            return res.status(400).json({ message: 'Already checked out today' });
        }

        attendance.checkOut = new Date();
        const diffMs = attendance.checkOut.getTime() - attendance.checkIn.getTime();
        const diffHrs = diffMs / (1000 * 60 * 60);
        attendance.workingHours = diffHrs;

        if (diffHrs < 4) attendance.dayType = 'Short Day';
        else if (diffHrs < 6) attendance.dayType = 'Half Day';
        else if (diffHrs < 8) attendance.dayType = 'Three Quarter Day';
        else attendance.dayType = 'Full Day';

        await attendance.save();

        if (io) {
            io.emit('attendance_update', { action: 'check-out', data: attendance });
        }

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

// @desc    Admin Mark Attendance for specific employee
// @route   POST /api/v1/attendance/admin-mark
// @access  Private (Admin/HR)
export const adminMarkAttendance = async (req, res, next) => {
    try {
        const { employeeId, date, status, dayType } = req.body;
        
        const targetDate = new Date(date);
        targetDate.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({ employeeId, date: targetDate });

        if (attendance) {
            attendance.status = status;
            attendance.dayType = dayType || 'Full Day';
            await attendance.save();
        } else {
            attendance = await Attendance.create({
                employeeId,
                date: targetDate,
                status,
                dayType: dayType || 'Full Day',
                checkIn: targetDate // Placeholder
            });
        }

        res.json(attendance);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete Attendance Record
// @route   DELETE /api/v1/attendance/:id
// @access  Private (Admin)
export const deleteAttendance = async (req, res, next) => {
    try {
        await Attendance.findByIdAndDelete(req.params.id);
        res.json({ message: 'Record removed' });
    } catch (error) {
        next(error);
    }
};
