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
    await db.collection('leader').insertMany([
        {
            name: 'John Smith',
            email: 'john.smith@example.com',
            phone: '780-111-2233',
            calling: 'Youth Leader',
            lodging_type: 'assigned',
            area: 'Edmonton North',
            allergies: true,
            diet_specific: false
        },
        {
            name: 'Emily Davis',
            email: 'emily.davis@example.com',
            phone: '780-222-3344',
            calling: 'Activity Coordinator',
            lodging_type: 'camper',
            area: 'Calgary South',
            allergies: true,
            diet_specific: true
        }
    ]);
});

afterAll(async () => {
    await testDB.close();
});

// Test: GET /leader
describe('GET /leader', () => {
    it('should return all leaders', async () => {
        const res = await request(app).get('/leader');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
});

// Test: GET /leader/:id
describe('GET /leader/:id', () => {
    it('should return a single leader by ID', async () => {
        const inserted = await db.collection('leader').insertOne({
            name: 'Test Leader',
            email: 'test.leader@example.com',
            phone: '780-333-4455',
            calling: 'Counselor',
            lodging_type: 'assigned',
            area: 'Red Deer'
        });

        const res = await request(app).get(`/leader/${inserted.insertedId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('name', 'Test Leader');
    });

    it('should return 400 for invalid ObjectId', async () => {
        const res = await request(app).get('/leader/invalidID');
        expect(res.statusCode).toBe(400);
    });
});

// Test: GET /leader/by-sleep?lodging_type=assigned
describe('GET /leader/by-sleep', () => {
    it('should return leaders filtered by lodging_type=assigned', async () => {
        const res = await request(app).get('/leader/by-sleep?lodging_type=assigned');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].lodging_type).toBe('assigned');
    });

    it('should return empty array if no leaders match the lodging_type', async () => {
        const res = await request(app).get('/leader/by-sleep?lodging_type=tent');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });

    it('should return 400 if lodging_type param is missing', async () => {
        const res = await request(app).get('/leader/by-sleep');
        expect(res.statusCode).toBe(400);
    });
});

// Test: GET /leader/by-allergies
describe('GET /leader/by-allergies', () => {
    it('should return leaders filtered by allergy', async () => {
        const res = await request(app).get('/leader/by-allergies');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].allergies).toBe(true);
    });
});

// Test: GET /leader/by-food
describe('GET /leader/by-food', () => {
    it('should return leaders filtered by food', async () => {
        const res = await request(app).get('/leader/by-food');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThan(0);
        expect(res.body[0].diet_specific).toBe(true);
    });
});
