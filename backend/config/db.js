import mongoose from 'mongoose';
import User from '../modules/auth/auth.model.js';

export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            family: 4 // Force IPv4 to resolve Atlas DNS issues
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Auto-seed Admin if database is empty (Essential for Render Free Tier)
        const userCount = await User.countDocuments();
        if (userCount === 0) {
            console.log('Database empty. Creating default admin...');
            await User.create({
                email: 'admin@lems.com',
                password: 'admin12@lems.com',
                role: 'ADMIN'
            });
            console.log('Default Admin Created: admin@lems.com / admin12@lems.com');
        }

        // DROP STALE UNIQUE INDEXES (Required when removing 'unique: true' from Mongoose)
        try {
            const Employee = mongoose.model('Employee');
            await User.collection.dropIndex('email_1');
            console.log('User Email Index Dropped');
            await Employee.collection.dropIndex('email_1');
            console.log('Employee Email Index Dropped');
        } catch (e) {
            // Index might already be gone or not exist
            console.log('Index cleanup note:', e.message);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};
