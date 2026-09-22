//We don't want the authentication blocking the tests. Mock the function to bypass"
jest.mock('../../middleware/authenticate', () => ({
    isAuthenticated: (req, res, next) => next(), // bypass auth
}));

const request = require('supertest');
const app = require('../../server');
const testDB = require('../testDB');
const { ObjectId } = require('mongodb');

let db;
let insertedYouth;

beforeAll(async () => {
    await testDB.connect();
    db = testDB.getDb();

    // Seed the youth collection
    insertedYouth = await db.collection('youth').insertMany([
        {
            _id: new ObjectId(),
            first_name: 'Alice',
            last_name: 'Johnson',
            email: 'alice.johnson@example.com',
            birthdate: '2009-05-20',
            ward: 'Sherwood Park 1st Ward',
            health_conditions: false,
            medications: true,
            allergies: false,
            diet_specific: false
        },
        {
            _id: new ObjectId(),
            first_name: 'Bob',
            last_name: 'Smith',
            email: 'bob.smith@example.com',
            birthdate: '2007-10-15',
            ward: 'Edmonton 2nd Ward',
            health_conditions: true,
            medications: false,
            allergies: true,
            diet_specific: true
        }
    ]);
});

afterAll(async () => {
    await testDB.close();
});


// GET /youth
describe('GET /youth', () => {
    it('should return all youth', async () => {
        const res = await request(app).get('/youth');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
});


// GET /youth/:id
describe('GET /youth/:id', () => {
    it('should return a youth member by ID', async () => {
        const youthId = insertedYouth.insertedIds[0].toString();
        const res = await request(app).get(`/youth/${youthId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', youthId);
        expect(res.body).toHaveProperty('first_name', 'Alice');
    });

    it('should return 500 for invalid ObjectId', async () => {
        const res = await request(app).get('/youth/invalidID');
        expect(res.statusCode).toBe(500);
    });
});

// GET /youth/by-age?min=&max=
describe('GET /youth/by-age', () => {
    it('should return youth filtered by age range', async () => {
        const res = await request(app).get('/youth/by-age?min=14&max=16');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });

    it('should return 400 for invalid age query', async () => {
        const res = await request(app).get('/youth/by-age?min=20&max=15');
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
    });
});

// GET /youth/by-ward?ward=
describe('GET /youth/by-ward', () => {
    it('should return youth filtered by ward', async () => {
        const res = await request(app).get('/youth/by-ward?ward=Sherwood%20Park%201st%20Ward');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].ward).toBe('Sherwood Park 1st Ward');
    });
});


// GET /youth/by-medical
describe('GET /youth/by-medical', () => {
    it('should return youth with medical needs', async () => {
        const res = await request(app).get('/youth/by-medical');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].health_conditions || res.body[0].medications).toBe(true);
    });
});


// GET /youth/by-allergies
describe('GET /youth/by-allergies', () => {
    it('should return youth with allergies', async () => {
        const res = await request(app).get('/youth/by-allergies');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].allergies).toBe(true);
    });
});


// GET /youth/by-food
describe('GET /youth/by-food', () => {
    it('should return youth with food restrictions', async () => {
        const res = await request(app).get('/youth/by-food');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0].diet_specific).toBe(true);
    });
});
