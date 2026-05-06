import Audit from '../modules/audit/audit.model.js';

export const auditLog = (action, entity) => {
    return async (req, res, next) => {
        // We need to wait for the response to finish to log successfully
        res.on('finish', async () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
                try {
                    await Audit.create({
                        userId: req.user ? req.user._id : null,
                        action,
                        entity,
                        entityId: req.params.id || res.locals.entityId || null,
                        details: req.body,
                        ipAddress: req.ip
                    });
                } catch (error) {
                    console.error('Audit Log Error:', error);
                }
            }
        });
        next();
    };
};
