
//We don't want the authentication blocking the tests. Mock the function to bypass"
jest.mock('../../middleware/authenticate', () => ({
    isAuthenticated: (req, res, next) => next(), // bypass auth
}));

const request = require('supertest');
const app = require('../../server');
const testDB = require('../testDB');

let db;

beforeAll(async () => {
    await testDB.connect();
    db = testDB.getDb();

    // Seed test data
    await db.collection('inquiries').insertMany([
        {
            name: 'Sarah Johnson',
            email: 'sarah.johnson@example.com',
            phone: '780-555-1234',
            subject: 'Question about Event Schedule',
            message: 'Will there be breaks during the day-long activities?',
            status: 'pending'
        },
        {
            name: 'Michael Brown',
            email: 'mbrown@example.com',
            phone: '780-555-5678',
            subject: 'Volunteer Opportunity',
            message: 'I would like to volunteer as a leader.',
            status: 'in-progress'
        }
    ]);
});

afterAll(async () => {
    await testDB.close();
});

// Test: GET /inquiries
describe('GET /inquiries', () => {
    it('should return all inquiries', async () => {
        const res = await request(app).get('/inquiries');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
});

// Test: GET /inquiries/:id
describe('GET /inquiries/:id', () => {
    it('should return a single inquiry by ID', async () => {
        const inserted = await db.collection('inquiries').insertOne({
            name: 'Test Inquiry',
            email: 'test@example.com',
            subject: 'Testing ID',
            message: 'Just testing get by ID.',
            status: 'pending'
        });

        const res = await request(app).get(`/inquiries/${inserted.insertedId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Test Inquiry');
    });

    it('should return 500 for invalid ObjectId', async () => {
        const res = await request(app).get('/inquiries/invalidID');
        expect(res.statusCode).toBe(500);
    });
});

// Test: GET /inquiries/:status
describe('GET /inquiries/by-status/:status', () => {
    it('should return inquiries filtered by status: pending', async () => {
        const res = await request(app).get('/inquiries/by-status/pending');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].status).toBe('pending');
    });

    it('should return empty array for valid but unused status', async () => {
        const res = await request(app).get('/inquiries/by-status/closed');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('should return 400 for invalid status', async () => {
        const res = await request(app).get('/inquiries/by-status/unknownstatus');
        expect(res.statusCode).toBe(400);
    });
});
