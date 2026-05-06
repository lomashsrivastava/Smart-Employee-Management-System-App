import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

console.log('Attempting to connect to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('✅ Atlas Connected Successfully!');
        process.exit(0);
    })
    .catch(err => {
        console.error('❌ Connection Failed:', err);
        process.exit(1);
    });
