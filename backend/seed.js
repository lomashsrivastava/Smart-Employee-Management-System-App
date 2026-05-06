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

        console.log('Database Initialized with Admin account: admin@lems.com');
        process.exit();
    } catch (error) {
        console.error(`${error}`);
        process.exit(1);
    }
};

seedDB();
