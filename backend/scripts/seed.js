import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../modules/auth/auth.model.js';
import Employee from '../modules/employee/employee.model.js';
import Attendance from '../modules/attendance/attendance.model.js';
import Leave from '../modules/leave/leave.model.js';

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB for system purge...');

        // 1. Purge all collections
        await User.deleteMany({});
        await Employee.deleteMany({});
        await Attendance.deleteMany({});
        await Leave.deleteMany({});
        console.log('System Purged: All existing nodes destroyed.');

        // 2. Create Admin User
        const adminUser = await User.create({
            email: 'admin@lomash.com',
            password: 'adminpassword',
            role: 'ADMIN',
            employeeId: 'ADMIN-001',
            isActive: true
        });
        console.log('Admin Node Created: admin@lomash.com / adminpassword');

        // 3. Create Demo Employee 1 (Active)
        const emp1User = await User.create({
            email: 'aditya@lomash.com',
            password: 'PAN1234567',
            role: 'EMPLOYEE',
            employeeId: '123456789012',
            aadhaarCard: '123456789012',
            panCard: 'PAN1234567',
            isActive: true
        });

        const emp1 = await Employee.create({
            userId: emp1User._id,
            employeeId: '123456789012',
            aadhaarCard: '123456789012',
            panCard: 'PAN1234567',
            firstName: 'Aditya',
            lastName: 'Sharma',
            email: 'aditya@lomash.com',
            gender: 'MALE',
            department: 'Engineering',
            position: 'Senior Developer',
            basicSalary: 85000,
            employmentStatus: 'ACTIVE',
            isDeleted: false
        });

        // 4. Create Demo Employee 2 (On Leave)
        const emp2User = await User.create({
            email: 'priya@lomash.com',
            password: 'PAN7654321',
            role: 'EMPLOYEE',
            employeeId: '987654321098',
            aadhaarCard: '987654321098',
            panCard: 'PAN7654321',
            isActive: true
        });

        const emp2 = await Employee.create({
            userId: emp2User._id,
            employeeId: '987654321098',
            aadhaarCard: '987654321098',
            panCard: 'PAN7654321',
            firstName: 'Priya',
            lastName: 'Verma',
            email: 'priya@lomash.com',
            gender: 'FEMALE',
            department: 'Marketing',
            position: 'Marketing Manager',
            basicSalary: 65000,
            employmentStatus: 'ON_LEAVE',
            isDeleted: false
        });

        // 5. Add some mock attendance for Aditya
        const today = new Date();
        today.setHours(0,0,0,0);
        await Attendance.create({
            employeeId: emp1._id,
            date: today,
            status: 'PRESENT',
            checkIn: new Date(),
            dayType: 'Full Day'
        });

        console.log('Demo Nodes Injected: System Restored with Clean Data.');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seedData();
