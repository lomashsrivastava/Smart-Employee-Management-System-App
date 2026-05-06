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

        // Check if user exists by Aadhaar (Primary ID)
        let user = await User.findOne({ $or: [{ employeeId }, { aadhaarCard }] });
        
        if (!user) {
            user = await User.create({
                email,
                employeeId,
                aadhaarCard,
                panCard,
                password: password,
                role: 'EMPLOYEE'
            });
        } else {
            // Update existing user to ensure they are active and have correct credentials
            user.isActive = true;
            if (email) user.email = email;
            user.panCard = panCard;
            await user.save();
        }

        // Data Sanitization
        const sanitizedBody = { ...req.body };
        if (!sanitizedBody.dob) delete sanitizedBody.dob;
        if (!sanitizedBody.joinDate) delete sanitizedBody.joinDate;
        if (!sanitizedBody.basicSalary) sanitizedBody.basicSalary = 0;

        // Check if Employee record exists (perhaps soft-deleted)
        let employee = await Employee.findOne({ $or: [{ employeeId }, { aadhaarCard }] });

        if (employee) {
            // Update/Restore existing employee
            employee = await Employee.findByIdAndUpdate(employee._id, {
                ...sanitizedBody,
                isDeleted: false,
                employmentStatus: 'ACTIVE',
                userId: user._id
            }, { new: true });
        } else {
            employee = await Employee.create({
                ...sanitizedBody,
                userId: user._id,
                employeeId,
                password: password
            });
        }

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

        // Hard delete employee and user
        const userId = employee.userId;
        await Employee.findByIdAndDelete(req.params.id);
        console.log("Employee record permanently erased");

        if (userId) {
            await User.findByIdAndDelete(userId);
            console.log("Associated User account permanently erased");
        }

        res.json({ 
            message: 'Employee and login account permanently erased from system',
            id: req.params.id 
        });
    } catch (error) {
        console.error('CRITICAL Hard Delete Error:', error);
        next(error);
    }
};
