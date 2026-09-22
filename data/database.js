const mongoClient = require('mongodb').MongoClient;

let database;

const initDB = (callback) => {
    if (database) {
        console.log('Moroni\'s Quest');
        return callback(null, database);
    }
    mongoClient.connect(process.env.MONGO_URL).then((client) => {
        database = client;
        callback(null, database);
    }).catch((err) => { callback(err); });
};

const getDatabase = () => {
    if (!database) {
        throw Error('Database not initialized')
    }
    return database;
};

module.exports = { initDB, getDatabase }