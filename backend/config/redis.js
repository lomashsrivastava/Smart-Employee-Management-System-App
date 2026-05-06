import { createClient } from 'redis';
import { Queue } from 'bullmq';

// Redis Client
export const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

redisClient.on('error', (err) => console.log('Redis Client Error', err));
redisClient.on('connect', () => console.log('Redis Client Connected'));

export const connectRedis = async () => {
    try {
        if (!redisClient.isOpen) {
            await redisClient.connect();
        }
    } catch (err) {
        console.error('Redis Connection Error:', err);
    }
};

// Queues
export const notificationQueue = new Queue('notifications', {
    connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
});

export const payrollQueue = new Queue('payroll', {
    connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379'
    }
});
