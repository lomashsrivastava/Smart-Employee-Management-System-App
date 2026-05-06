import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    checkIn: {
        type: Date
    },
    checkOut: {
        type: Date
    },
    status: {
        type: String,
        enum: ['PRESENT', 'ABSENT', 'HALF_DAY', 'LATE'],
        default: 'PRESENT'
    },
    workingHours: {
        type: Number,
        default: 0
    },
    dayType: {
        type: String,
        enum: ['Full Day', 'Half Day', 'Short Day', 'Three Quarter Day'],
        default: 'Full Day'
    }
}, {
    timestamps: true
});

export default mongoose.model('Attendance', attendanceSchema);
