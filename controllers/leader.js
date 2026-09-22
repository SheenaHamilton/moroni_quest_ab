const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAllLeaders = async (req, res) => {
    //#swagger.tags=['Leader']
    try {
        const result = await mongodb.getDatabase().db().collection('leader').find();
        result.toArray().then((Leader) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(Leader);
        });
    } catch (err) {
        console.error('Error getAll:', err);
        res.status(500).json({ message: `We encountered an issue retreiving the list of all Leader registrations. Please try agin later.` });
    }
};

const getLeader = async (req, res) => {
    //#swagger.tags=['Leader']
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: `getLeader: Not valid identifier` });
    }
    try {
        const LeaderId = new ObjectId(req.params.id);
        const result = await mongodb.getDatabase().db().collection('leader').find({ _id: LeaderId });
        result.toArray().then((Leader) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(Leader[0]);
        });
    } catch (err) {
        console.error('Error getSingle:', err);
        res.status(500).json({ message: `We encountered an error while looking up the Leader registration. Please try again.` });
    }
};

const getLeaderByAllergies = async (req, res) => {
    //#swagger.tags=['Leader']
    try {

        // Query: find Leader by allergies. 
        const result = await mongodb.getDatabase().db().collection('leader').find({ allergies: true }).toArray();
        res.status(200).json(result);

    } catch (err) {
        console.error('Error querying Leader by allergies:', err);
        res.status(500).json({ message: 'Error retrieving Leader by allergies' });
    }
};

const getLeaderByFoodIssues = async (req, res) => {
    //#swagger.tags=['Leader']
    try {
        // Query: find Leader by diet_specific needs
        const result = await mongodb.getDatabase().db().collection('leader').find({ diet_specific: true }).toArray();
        res.status(200).json(result);

    } catch (err) {
        console.error('Error querying Leader by diet specific needs:', err);
        res.status(500).json({ message: 'Error retrieving Leader by diet specific needs' });
    }
};


const getLeaderBySleepingArrangement = async (req, res) => {
    //#swagger.tags=['Leader']
    try {
        const lodging_type = req.query.lodging_type;
        const result = await mongodb.getDatabase().db().collection('leader').find({ lodging_type: lodging_type }).toArray();
        res.status(200).json(result);

    } catch (err) {
        console.error('Error querying Leader by sleeping arrangement:', err);
        res.status(500).json({ message: 'Error retrieving Leader by sleeping arrangement' });
    }
};

const updateLeader = async (req, res) => {
    //#swagger.tags=['Leader']
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: `updateLeader: Not valid identifier` });
    }
    const LeaderId = new ObjectId(req.params.id);
    const Leader = {
        timestamp: req.body.timestamp, //Keep the original time the registration was recorded
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        ward: req.body.ward,
        birthdate: new Date(req.body.birthdate),
        address_street: req.body.address_street,
        address_city: req.body.address_city,
        address_province: req.body.address_province,
        address_postal: req.body.address_postal,

        emergency_contact_name: req.body.emergency_contact_name,
        emergency_contact_primary: req.body.emergency_contact_primary,
        emergency_contact_secondary: req.body.emergency_contact_secondary,

        health_number: req.body.health_number,

        diet_specific: req.body.diet_specific,
        diet_description: req.body.diet_description,

        allergies: req.body.allergies,
        allergies_description: req.body.allergies_description,

        role: req.body.role,
        arrival_date: new Date(req.body.arrival_date),
        departure_date: new Date(req.body.departure_date),

        lodging_type: req.body.lodging_type,
        lodging_description: req.body.lodging_description,

        terms_understood: req.body.terms_understood,
        media_consent_internal: req.body.media_consent_internal,
        media_consent_external: req.body.media_consent_external,
        media_release_understood: req.body.media_release_understood,

        form_completed_by: req.body.form_completed_by,
        date_completed: new Date()
    };
    try {
        const response = await mongodb.getDatabase().db().collection('leader').replaceOne({ _id: LeaderId }, Leader);
        if (response.modifiedCount > 0) {
            res.status(204).send();
        } else {
            res.status(500).json(response.error || 'Error occured while updating the Leader registrations. No changes made.');

        }
    } catch (err) {
        console.error('Error updateLeader:', err);
        res.status(500).json({ message: `We encountered an error while updating the Leader registration ${req.params.id}` });
    }
};

const createLeader = async (req, res) => {
    //#swagger.tags=['Leader']
    const Leader = {
        timestamp: new Date(),
        email: req.body.email,
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        ward: req.body.ward,
        birthdate: new Date(req.body.birthdate),
        address_street: req.body.address_street,
        address_city: req.body.address_city,
        address_province: req.body.address_province,
        address_postal: req.body.address_postal,

        emergency_contact_name: req.body.emergency_contact_name,
        emergency_contact_primary: req.body.emergency_contact_primary,
        emergency_contact_secondary: req.body.emergency_contact_secondary,

        health_number: req.body.health_number,

        diet_specific: req.body.diet_specific,
        diet_description: req.body.diet_description,

        allergies: req.body.allergies,
        allergies_description: req.body.allergies_description,

        role: req.body.role,
        arrival_date: new Date(req.body.arrival_date),
        departure_date: new Date(req.body.departure_date),

        lodging_type: req.body.lodging_type,
        lodging_description: req.body.lodging_description,

        terms_understood: req.body.terms_understood,
        media_consent_internal: req.body.media_consent_internal,
        media_consent_external: req.body.media_consent_external,
        media_release_understood: req.body.media_release_understood,

        form_completed_by: req.body.form_completed_by,
        date_completed: new Date()
    };

    try {
        const response = await mongodb.getDatabase().db().collection('leader').insertOne(Leader);
        if (response.acknowledged) {
            res.status(201).send({ id: response.insertedId, ...Leader });
        } else {
            res.status(500).json(response.error || 'An error occured while adding the Leader registration. Registration was not recorded.');
        }
    } catch (err) {
        console.error('Error createLeader:', err);
        res.status(500).json({ message: `We encountered an error while creating the Leader registration` });
    }
};

const deleteLeader = async (req, res) => {
    //#swagger.tags=['Leader']
    const LeaderId = new ObjectId(req.params.id);

    const response = await mongodb.getDatabase().db().collection('leader').deleteOne({ _id: LeaderId });
    if (response.deletedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Error occured while deleting the Leader registration.');

    }
};

module.exports = { getAllLeaders, getLeader, getLeaderByAllergies, getLeaderByFoodIssues, getLeaderBySleepingArrangement, updateLeader, createLeader, deleteLeader }