import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './modules/auth/auth.model.js';

dotenv.config();

const testPassword = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/ems');
        console.log('Connected to DB');
        
        const user = await User.findOne({ email: 'admin@admin.com' }).select('+password');
        if (user) {
            console.log('User found:', user.email);
            const isMatch = await bcrypt.compare('admin@admin.com', user.password);
            console.log('Password match test (admin@admin.com):', isMatch);
            
            // Log the hash for debugging (careful, this is a scratch script)
            console.log('Stored Hash:', user.password);
        } else {
            console.log('User NOT found');
        }
        
        process.exit();
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

testPassword();
