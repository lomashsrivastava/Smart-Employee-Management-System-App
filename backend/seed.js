import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/auth/auth.model.js';
import Employee from './modules/employee/employee.model.js';

dotenv.config();

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ems_app');
        console.log('MongoDB Connected for Seeding');

        const userCount = await User.countDocuments();
        if (userCount > 0 && !process.argv.includes('--force')) {
            console.log('Database already contains data. Use --force to re-seed.');
            process.exit();
        }

        console.log('Cleaning existing data...');
        await User.deleteMany();
        await Employee.deleteMany();

        // Create Admin
        await User.create({
            email: 'admin@lems.com',
            password: 'admin12@lems.com',
            role: 'ADMIN'
        });

        // Create Demo Staff
        const staffEmail = 'demo.staff@lems.com';
        const staffPass = 'staff123';
        
        const staffUser = await User.create({
            email: staffEmail,
            password: staffPass,
            role: 'EMPLOYEE'
        });

        await Employee.create({
            userId: staffUser._id,
            employeeId: 'EMP001',
            firstName: 'Demo',
            lastName: 'Member',
            email: staffEmail,
            phone: '9876543210',
            aadhaarCard: '1234 5678 9012',
            panCard: 'ABCDE1234F',
            gender: 'Male',
            department: 'Engineering',
            position: 'Senior Developer',
            basicSalary: 85000,
            employmentStatus: 'ACTIVE',
            joinDate: new Date()
        });

        console.log('Database Initialized:');
        console.log('Admin: admin@lems.com / admin12@lems.com');
        console.log('Staff: 1234 5678 9012 / ABCDE1234F (Aadhaar/PAN)');
        process.exit();
    } catch (error) {
        console.error(`Error: ${error}`);
        process.exit(1);
    }
};

seedDB();
