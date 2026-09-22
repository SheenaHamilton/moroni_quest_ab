const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

// Get all photos
const getAllPhotos = async (req, res) => {
    //#swagger.tags=['Photos']
    try {
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('photos')
            .find()
            .toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get photo by id
const getPhotoById = async (req, res) => {
    //#swagger.tags=['Photos']
    try {
        const photoId = new ObjectId(req.params.id);
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('photos')
            .findOne({ _id: photoId });
        if (!result) {
            return res.status(404).json({ message: 'Photo not found' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get photos by event
const getPhotosByEvent = async (req, res) => {
    //#swagger.tags=['Photos']
    try {
        const event = req.params.event;
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('photos')
            .find({ event: event })
            .toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get photos by date
const getPhotosByDate = async (req, res) => {
    //#swagger.tags=['Photos']
    try {
        const date = req.params.date;
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('photos')
            .find({ date: date })
            .toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Create new photo
const createPhoto = async (req, res) => {
    //#swagger.tags=['Photos']
    try {
        const photo = {
            url: req.body.url,
            title: req.body.title,
            description: req.body.description,
            event: req.body.event,
            date: req.body.date,
            uploadedBy: req.body.uploadedBy,
            createdAt: new Date(),
        };
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('photos')
            .insertOne(photo);
        if (result.acknowledged) {
            res.status(201).json({
                message: 'Photo created successfully',
                id: result.insertedId,
            });
        } else {
            res.status(500).json({ message: 'Error creating photo' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Update photo
const updatePhoto = async (req, res) => {
    //#swagger.tags=['Photos']
    try {
        const photoId = new ObjectId(req.params.id);
        const photo = {
            url: req.body.url,
            title: req.body.title,
            description: req.body.description,
            event: req.body.event,
            date: req.body.date,
            uploadedBy: req.body.uploadedBy,
            updatedAt: new Date(),
        };
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('photos')
            .updateOne({ _id: photoId }, { $set: photo });
        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Photo updated successfully' });
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete photo
const deletePhoto = async (req, res) => {
    //#swagger.tags=['Photos']
    try {
        const photoId = new ObjectId(req.params.id);
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('photos')
            .deleteOne({ _id: photoId });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Photo deleted successfully' });
        } else {
            res.status(404).json({ message: 'Photo not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    getAllPhotos,
    getPhotoById,
    getPhotosByEvent,
    getPhotosByDate,
    createPhoto,
    updatePhoto,
    deletePhoto,
};