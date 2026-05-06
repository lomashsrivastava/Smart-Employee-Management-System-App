import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    employeeId: {
        type: String,
        required: true,
        unique: true
    },
    aadhaarCard: {
        type: String,
        required: true,
        unique: true
    },
    panCard: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    password: {
        type: String
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    alternateEmail: String,
    phone: String,
    alternatePhone: String,
    age: Number,
    dob: Date,
    maritalStatus: String,
    bankAccountNo: String,
    bankName: String,
    department: {
        type: String,
        required: true
    },
    position: {
        type: String,
        required: true
    },
    employmentType: String,
    bondAgreement: {
        type: String,
        default: 'No'
    },
    basicSalary: {
        type: Number,
        required: true
    },
    allowances: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    fatherName: String,
    motherName: String,
    villageTown: String,
    locality: String,
    city: String,
    state: String,
    country: {
        type: String,
        default: 'India'
    },
    pinCode: String,
    biometricId: String,
    totalExperience: String,
    experienceSummary: String,
    skills: String,
    qualifications: String,
    documentUrl: String,
    employeeBadgeId: String,
    emergencyContact: String,
    employmentStatus: {
        type: String,
        enum: ['ACTIVE', 'ON_LEAVE', 'TERMINATED'],
        default: 'ACTIVE'
    },
    joinDate: {
        type: Date,
        default: Date.now
    },
    bio: String,
    isDeleted: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

export default mongoose.model('Employee', employeeSchema);

