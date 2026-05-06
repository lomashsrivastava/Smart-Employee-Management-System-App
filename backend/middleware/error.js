export const errorHandler = (err, req, res, next) => {
    console.error('SERVER_ERROR:', err);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    
    // Mongoose bad ObjectId
    if (err.name === 'CastError' && err.kind === 'ObjectId') {
        return res.status(404).json({ message: 'Resource not found' });
    }

    // Mongoose duplicate key
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Duplicate field value entered' });
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message).join(', ');
        return res.status(400).json({ message });
    }

    res.status(statusCode).json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack,
    });
};

export const notFound = (req, res, next) => {
    const error = new Error(`Not Found - ${req.originalUrl}`);
    res.status(404);
    next(error);
};
