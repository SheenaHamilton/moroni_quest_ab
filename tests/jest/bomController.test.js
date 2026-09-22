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
    await db.collection('bomchallenges').insertMany([
        {
            title: 'Test Challenge 1',
            description: 'First challenge',
            book: '1 Nephi',
            chapters: [1, 2],
            startDate: '2025-01-01',
            endDate: '2025-01-07',
        },
        {
            title: 'Test Challenge 2',
            description: 'Second challenge',
            book: 'Alma',
            chapters: [5, 6],
            startDate: '2025-02-01',
            endDate: '2025-02-10',
        },
    ]);
});

afterAll(async () => {
    await testDB.close();
});

// Test: GET /bomchallenges
describe('GET /bomchallenges', () => {
    it('should return all challenges', async () => {
        await db.collection('bomchallenges').insertOne({
            title: 'Extra Challenge',
            description: 'extra',
        });

        const res = await request(app).get('/bomchallenges');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
    });
});

// Test: GET /bomchallenges/:id
describe('GET /bomchallenges/:id', () => {
    it('should return a challenge by ID', async () => {
        const challenge = await db.collection('bomchallenges').insertOne({
            title: 'Get by ID test',
            description: 'Test case',
        });

        const res = await request(app).get(`/bomchallenges/${challenge.insertedId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body.title).toBe('Get by ID test');
    });
    it('should return an error if not a proper ObjectID', async () => {
        const res = await request(app).get(`/bomchallenges/7766gg55`);
        expect(res.statusCode).toBe(500);
    });
});

// Test: GET /bomchallenges/by-book/:book
describe('GET /bomchallenges/by-book/:book', () => {
    it('should return all challenges for the specified book', async () => {
        const res = await request(app).get('/bomchallenges/by-book/Alma');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].book).toBe('Alma');
        expect(res.body[0]).toHaveProperty('title', 'Test Challenge 2');
    });
    it('should return 400 error for incorrect Book name', async () => {
        const res = await request(app).get('/bomchallenges/by-book/Almas');
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/Must be a valid Book of Mormon book name/i);
    });
    it('should return an empty array if no challenges match the book', async () => {
        const res = await request(app).get('/bomchallenges/by-book/Enos');
        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual([]);
    });
});


// Test: GET /bomchallenges/by-schedule/:date
describe('GET /bomchallenges/by-schedule/:date', () => {
    it('should return challenges that include the given date in range', async () => {
        const res = await request(app).get('/bomchallenges/by-schedule/2025-01-01');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(1);
        expect(res.body[0].book).toBe('1 Nephi');
    });
    it('should return 400 error for incorrect date format', async () => {
        const res = await request(app).get('/bomchallenges/by-schedule/2025-0-11');
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/Date must be a valid date./i);
    });
    it('should return an empty array if no challenges occur on the given date', async () => {
        const res = await request(app).get('/bomchallenges/by-schedule/2024-08-01');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBe(0);
    });
});
