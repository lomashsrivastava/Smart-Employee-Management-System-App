import Employee from './employee.model.js';
import User from '../auth/auth.model.js';

// @desc    Get all employees
// @route   GET /api/v1/employee
// @access  Private
export const getEmployees = async (req, res, next) => {
    try {
        const employees = await Employee.find({ isDeleted: { $ne: true } }).populate('userId', 'email role');
        res.json(employees);
    } catch (error) {
        next(error);
    }
};

// @desc    Get single employee
// @route   GET /api/v1/employee/:id
// @access  Private
export const getEmployeeById = async (req, res, next) => {
    try {
        const employee = await Employee.findById(req.params.id).populate('userId', 'email role');
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
};

// @desc    Create new employee
// @route   POST /api/v1/employee
// @access  Private (Admin/HR)
export const createEmployee = async (req, res, next) => {
    try {
        console.log('Incoming Employee Onboarding Data:', req.body);
        const { email, firstName, lastName, aadhaarCard, panCard } = req.body;
        
        if (!aadhaarCard) {
            return res.status(400).json({ message: 'Aadhaar Card (Employee ID) is required' });
        }

        // Use Aadhaar as Employee ID
        const employeeId = aadhaarCard;
        const password = panCard || 'password123';

        // Check if user exists by email or Aadhaar
        let user = await User.findOne({ $or: [{ email }, { employeeId }, { aadhaarCard }] });
        
        if (!user) {
            // Create user automatically for login
            user = await User.create({
                email,
                employeeId,
                aadhaarCard,
                panCard,
                password: password, // PAN Card is the password
                role: 'EMPLOYEE'
            });
        }

        // Data Sanitization
        const sanitizedBody = { ...req.body };
        if (!sanitizedBody.dob) delete sanitizedBody.dob;
        if (!sanitizedBody.joinDate) delete sanitizedBody.joinDate;
        if (!sanitizedBody.basicSalary) sanitizedBody.basicSalary = 0;

        const employee = await Employee.create({
            ...sanitizedBody,
            userId: user._id,
            employeeId,
            password: password
        });

        res.status(201).json(employee);
    } catch (error) {
        console.error('CRITICAL ONBOARDING FAILURE:', error);
        next(error);
    }
};

// @desc    Update employee
// @route   PUT /api/v1/employee/:id
// @access  Private (Admin/HR)
export const updateEmployee = async (req, res, next) => {
    try {
        const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }
        res.json(employee);
    } catch (error) {
        next(error);
    }
};

// @desc    Delete employee
// @route   DELETE /api/v1/employee/:id
// @access  Private (Admin/HR)
export const deleteEmployee = async (req, res, next) => {
    try {
        console.log("Delete Request for ID:", req.params.id, "by User:", req.user?._id);
        const employee = await Employee.findById(req.params.id);
        
        if (!employee) {
            console.warn("Delete failed: Employee not found in DB");
            return res.status(404).json({ message: 'Employee not found' });
        }

        console.log("Found Employee:", employee.firstName, employee.lastName);

        // Soft delete and deactivate user
        employee.isDeleted = true;
        employee.employmentStatus = 'TERMINATED';
        await employee.save();
        console.log("Employee marked as deleted");

        if (employee.userId) {
            await User.findByIdAndUpdate(employee.userId, { isActive: false });
            console.log("Associated User account deactivated");
        }

        res.json({ 
            message: 'Employee terminated and access revoked',
            id: employee._id 
        });
    } catch (error) {
        console.error('CRITICAL Delete Employee Error:', error);
        next(error);
    }
};
