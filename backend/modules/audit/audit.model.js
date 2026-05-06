import mongoose from 'mongoose';

const auditSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    action: {
        type: String,
        required: true
    },
    entity: {
        type: String,
        required: true
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId
    },
    details: {
        type: Object
    },
    ipAddress: String
}, {
    timestamps: true
});

export default mongoose.model('Audit', auditSchema);
