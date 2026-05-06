import User from './auth.model.js';
import jwt from 'jsonwebtoken';

// Generate token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET || 'super_secret_jwt_key_example_12345', {
        expiresIn: process.env.JWT_EXPIRE || '7d',
    });
};

// @desc    Register a user
// @route   POST /api/v1/auth/register
// @access  Public (or Admin only depending on logic)
export const register = async (req, res, next) => {
    try {
        const { email, password, role } = req.body;

        const userExists = await User.findOne({ email });

        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            email,
            password,
            role
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Login user & get token
// @route   POST /api/v1/auth/login
// @access  Public
export const login = async (req, res, next) => {
    try {
        let { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email/ID and password' });
        }

        // Strip spaces if it's an Aadhaar number
        const loginId = email.replace(/\s/g, '');

        // Find user by email, employeeId, or aadhaarCard
        const user = await User.findOne({
            $or: [
                { email: loginId }, 
                { employeeId: loginId }, 
                { aadhaarCard: loginId }
            ]
        }).select('+password');

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isActive) {
            return res.status(403).json({ message: 'Your account has been deactivated. Please contact HR.' });
        }

        const isMatch = await user.matchPassword(password);

        if (user && isMatch) {
            res.json({
                _id: user._id,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (error) {
        next(error);
    }
};

// @desc    Get current logged in user
// @route   GET /api/v1/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.json(user);
    } catch (error) {
        next(error);
    }
};
