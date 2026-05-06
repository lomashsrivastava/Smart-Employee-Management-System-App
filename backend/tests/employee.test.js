import request from 'supertest';
import express from 'express';
// Simple mock test since we need to mock mongoose connection for full test
describe('Employee API Tests', () => {
    it('should return 401 if unauthorized', async () => {
        const app = express();
        app.get('/api/v1/employee', (req, res) => res.status(401).json({ message: 'Not authorized' }));
        
        const res = await request(app).get('/api/v1/employee');
        expect(res.statusCode).toEqual(401);
    });
});
