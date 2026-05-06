import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './modules/auth/auth.model.js';

dotenv.config();

const checkUser = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ems');
        console.log('Connected to DB');
        
        const user = await User.findOne({ email: 'admin@admin.com' }).select('+password');
        if (user) {
            console.log('User found:', user.email);
            console.log('Role:', user.role);
        } else {
            console.log('User NOT found');
        }
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

checkUser();
