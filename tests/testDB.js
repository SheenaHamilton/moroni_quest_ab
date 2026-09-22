// tests/setupTestDB.js
const MongoMemoryServer = require('mongodb-memory-server').MongoMemoryServer;
const MongoClient = require('mongodb').MongoClient;
const mongodb = require('../data/database');

let mongoServer;
let client;
let db;

async function connect() {
    // Start in-memory MongoDB, Mock the database.js settings
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    client = await MongoClient.connect(uri, {});
    db = client.db();

    mongodb.initDB = (callback) => {
        mongodb.getDatabase = () => client;
        callback(null, client);
    };

    mongodb.initDB(() => { });
}

async function close() {
    if (client) await client.close();
    if (mongoServer) await mongoServer.stop();
}

async function clear() {
    const collections = await db.collections();
    for (const collection of collections) {
        await collection.deleteMany({});
    }
}

module.exports = { connect, close, clear, getDb: () => db };
