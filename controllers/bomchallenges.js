const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

// Get all Book of Mormon challenges
const getAllChallenges = async (req, res) => {
    //#swagger.tags=['Book of Mormon Challenges']
    try {
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('bomchallenges')
            .find()
            .toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get challenge by id
const getChallengeById = async (req, res) => {
    //#swagger.tags=['Book of Mormon Challenges']
    try {
        const challengeId = new ObjectId(req.params.id);
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('bomchallenges')
            .findOne({ _id: challengeId });
        if (!result) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get challenges by book
const getChallengesByBook = async (req, res) => {
    //#swagger.tags=['Book of Mormon Challenges']
    try {
        const book = req.params.book;
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('bomchallenges')
            .find({ book: book })
            .toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get challenges by schedule/date
const getChallengesBySchedule = async (req, res) => {
    //#swagger.tags=['Book of Mormon Challenges']
    try {
        const date = req.params.date;
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('bomchallenges')
            .find({
                $or: [
                    { startDate: date },
                    { endDate: date },
                    {
                        startDate: { $lte: date },
                        endDate: { $gte: date },
                    },
                ],
            })
            .toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new challenge
const createChallenge = async (req, res) => {
    //#swagger.tags=['Book of Mormon Challenges']
    try {
        const challenge = {
            title: req.body.title,
            description: req.body.description,
            book: req.body.book,
            chapters: req.body.chapters,
            verses: req.body.verses,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            points: req.body.points || 0,
            createdAt: new Date(),
        };
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('bomchallenges')
            .insertOne(challenge);
        if (result.acknowledged) {
            res.status(201).json({
                message: 'Challenge created successfully',
                id: result.insertedId,
            });
        } else {
            res.status(500).json({ message: 'Error creating challenge' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update challenge
const updateChallenge = async (req, res) => {
    //#swagger.tags=['Book of Mormon Challenges']
    try {
        const challengeId = new ObjectId(req.params.id);
        const challenge = {
            title: req.body.title,
            description: req.body.description,
            book: req.body.book,
            chapters: req.body.chapters,
            verses: req.body.verses,
            startDate: req.body.startDate,
            endDate: req.body.endDate,
            points: req.body.points,
            updatedAt: new Date(),
        };
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('bomchallenges')
            .updateOne({ _id: challengeId }, { $set: challenge });
        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Challenge updated successfully' });
        } else {
            res.status(404).json({ message: 'Challenge not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete challenge
const deleteChallenge = async (req, res) => {
    //#swagger.tags=['Book of Mormon Challenges']
    try {
        const challengeId = new ObjectId(req.params.id);
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('bomchallenges')
            .deleteOne({ _id: challengeId });
        if (result.deletedCount > 0) {
            res.status(200).json({
                message: 'Challenge deleted successfully',
            });
        } else {
            res.status(404).json({ message: 'Challenge not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllChallenges,
    getChallengeById,
    getChallengesByBook,
    getChallengesBySchedule,
    createChallenge,
    updateChallenge,
    deleteChallenge,
};