import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';
import http from 'http';
import { Server } from 'socket.io';

// Configs
import { connectDB } from './config/db.js';
import { connectRedis } from './config/redis.js';

// Middlewares
import { errorHandler, notFound } from './middleware/error.js';

// Routes
import authRoutes from './modules/auth/auth.routes.js';
import employeeRoutes from './modules/employee/employee.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import leaveRoutes from './modules/leave/leave.routes.js';
import payrollRoutes from './modules/payroll/payroll.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';

// Load env vars
dotenv.config();

// Connect to Database and Redis
connectDB();
connectRedis();

const app = express();
const server = http.createServer(app);

// Socket.io for Real-time
export const io = new Server(server, {
    cors: {
        origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174'],
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }
});

io.on('connection', (socket) => {
    console.log('User connected to WebSocket:', socket.id);
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

// Security & Middlewares
app.use(helmet());
app.use(cors({ origin: [process.env.CLIENT_URL || 'http://localhost:3000', 'http://localhost:5173', 'http://localhost:5174', 'https://lsems.netlify.app'], credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(mongoSanitize());
app.use(morgan('dev'));

// Rate Limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // limit each IP to 1000 requests per windowMs
    message: 'Too many requests from this IP, please try again later'
});
app.use('/api/', limiter);

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/employee', employeeRoutes);
app.use('/api/v1/attendance', attendanceRoutes);
app.use('/api/v1/leave', leaveRoutes);
app.use('/api/v1/payroll', payrollRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

app.get('/', (req, res) => {
    res.send('API is running...');
});

// Error Handlers
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
