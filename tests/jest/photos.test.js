//We don't want the authentication blocking the tests. Mock the function to bypass"
jest.mock('../../middleware/authenticate', () => ({
    isAuthenticated: (req, res, next) => next(), // bypass auth
}));

const request = require('supertest');
const app = require('../../server');
const testDB = require('../testDB');
const { ObjectId } = require('mongodb');

let db;
let insertedPhotos;

beforeAll(async () => {
    await testDB.connect();
    db = testDB.getDb();

    // Seed the photos collection
    insertedPhotos = await db.collection('photos').insertMany([
        {
            _id: new ObjectId('6717b1a36e5a9b43217d0001'),
            url: 'https://example.com/photos/opening.jpg',
            title: 'Opening Ceremony',
            description: 'The grand opening event.',
            event: 'Opening Ceremony',
            date: '2024-07-15',
            uploadedBy: 'Admin'
        },
        {
            _id: new ObjectId('6717b1a36e5a9b43217d0002'),
            url: 'https://example.com/photos/closing.jpg',
            title: 'Closing Celebration',
            description: 'The closing ceremony and awards.',
            event: 'Closing Ceremony',
            date: '2024-07-20',
            uploadedBy: 'Admin'
        }
    ]);
});

afterAll(async () => {
    await testDB.close();
});


// GET /photos
describe('GET /photos', () => {
    it('should return all photos', async () => {
        const res = await request(app).get('/photos');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body.length).toBeGreaterThanOrEqual(2);
    });
});


// GET /photos/:id
describe('GET /photos/:id', () => {
    it('should return a photo by ID', async () => {
        const photoId = insertedPhotos.insertedIds[0].toString();
        const res = await request(app).get(`/photos/${photoId}`);
        expect(res.statusCode).toBe(200);
        expect(res.body).toHaveProperty('_id', photoId);
        expect(res.body).toHaveProperty('title', 'Opening Ceremony');
    });

    it('should return 500 for invalid ObjectId', async () => {
        const res = await request(app).get('/photos/invalidID');
        expect(res.statusCode).toBe(500);
    });
});

// GET /photos/by-event/:event
describe('GET /photos/by-event/:event', () => {
    it('should return photos for a given event', async () => {
        const res = await request(app).get('/photos/by-event/Opening Ceremony');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('event', 'Opening Ceremony');
    });
});

// GET /photos/by-date/:date
describe('GET /photos/by-date/:date', () => {
    it('should return photos for a given date', async () => {
        const res = await request(app).get('/photos/by-date/2024-07-15');
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body)).toBe(true);
        expect(res.body[0]).toHaveProperty('date', '2024-07-15');
    });

    it('should fail validation for invalid date', async () => {
        const res = await request(app).get('/photos/by-date/not-a-date');
        expect(res.statusCode).toBe(400);
        expect(res.body).toHaveProperty('message');
        expect(res.body.message).toMatch(/valid date/i);
    });
});
