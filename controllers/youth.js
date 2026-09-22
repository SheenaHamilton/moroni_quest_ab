const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const getAllYouth = async (req, res) => {
    //#swagger.tags=['Youth']
    try {
        const result = await mongodb.getDatabase().db().collection('youth').find();
        result.toArray().then((youth) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(youth);
        });
    } catch (err) {
        console.error('Error getAll:', err);
        res.status(500).json({ message: `We encountered an issue retreiving the list of all youth registrations. Please try agin later.` });
    }
};

const getYouth = async (req, res) => {
    //#swagger.tags=['Youth']
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(500).json({ message: `getYouth: Not valid identifier` });
    }
    try {
        const youthId = new ObjectId(req.params.id);
        const result = await mongodb.getDatabase().db().collection('youth').find({ _id: youthId });
        result.toArray().then((youth) => {
            res.setHeader('Content-Type', 'application/json');
            res.status(200).json(youth[0]);
        });
    } catch (err) {
        console.error('Error getSingle:', err);
        res.status(500).json({ message: `We encountered an error while looking up the youth registration. Please try again.` });
    }
};

const getYouthByMedical = async (req, res) => {
    //#swagger.tags=['Youth']
    try {
        // Query: find youth by health issues or medications. 
        const result = await mongodb.getDatabase().db().collection('youth').find({ $or: [{ health_conditions: true }, { medications: true }] }).toArray();
        res.status(200).json(result);

    } catch (err) {
        console.error('Error querying youth by health and medications:', err);
        res.status(500).json({ message: 'Error retrieving youth by health and medications' });
    }
};

const getYouthByAllergies = async (req, res) => {
    //#swagger.tags=['Youth']
    try {

        // Query: find youth by allergies. 
        const result = await mongodb.getDatabase().db().collection('youth').find({ allergies: true }).toArray();
        res.status(200).json(result);

    } catch (err) {
        console.error('Error querying youth by allergies:', err);
        res.status(500).json({ message: 'Error retrieving youth by allergies' });
    }
};
const getYouthByFoodIssues = async (req, res) => {
    //#swagger.tags=['Youth']
    try {
        // Query: find youth by diet_specific needs
        const result = await mongodb.getDatabase().db().collection('youth').find({ diet_specific: true }).toArray();
        res.status(200).json(result);

    } catch (err) {
        console.error('Error querying youth by diet specific needs:', err);
        res.status(500).json({ message: 'Error retrieving youth by diet specific needs' });
    }
};

const getYouthByWard = async (req, res) => {
    //#swagger.tags=['Youth']
    try {
        const ward = req.query.ward;

        // Query: find youth by ward
        const result = await mongodb.getDatabase().db().collection('youth').find({ ward: ward }).toArray();
        res.status(200).json(result);

    } catch (err) {
        console.error('Error querying youth by ward:', err);
        res.status(500).json({ message: 'Error retrieving youth by ward' });
    }
};

const getYouthByAge = async (req, res) => {
    //#swagger.tags=['Youth']
    try {
        const minAge = parseInt(req.query.min);
        const maxAge = parseInt(req.query.max);

        const now = new Date();
        const currentYear = now.getFullYear();

        // event date cutoff — July 5 of this year
        const eventMonth = 6;
        const eventDay = 5;

        const maxBirthYear = currentYear - maxAge;
        const minBirthYear = currentYear - minAge;

        //Use youth age on the date of the event
        const minBirthDate = new Date(minBirthYear, eventMonth, eventDay);
        const maxBirthDate = new Date(maxBirthYear, eventMonth, eventDay);


        // Query: find youth whose birthdate is >=  min and <= Max 
        const result = await mongodb.getDatabase().db().collection('youth').find({ birthdate: { $gte: maxBirthDate, $lte: minBirthDate } }).toArray();
        res.status(200).json(result);

    } catch (err) {
        console.error('Error querying youth by age:', err);
        res.status(500).json({ message: 'Error retrieving youth by age' });
    }
};

const updateYouth = async (req, res) => {
    //#swagger.tags=['Youth']
    if (!ObjectId.isValid(req.params.id)) {
        return res.status(400).json({ message: `updateYouth: Not valid identifier` });
    }
    const youthId = new ObjectId(req.params.id);
    const youth = {
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

        medications: req.body.medications,
        medications_self_administer: req.body.medications_self_administer,
        medications_administer_description: req.body.medications_administer_description,
        medications_description: req.body.medications_description,

        health_conditions: req.body.health_conditions,
        health_conditions_description: req.body.health_conditions_description,
        surgery_recent: req.body.surgery_recent,
        surgery_description: req.body.surgery_description,
        physical_limitations: req.body.physical_limitations,
        other_needs: req.body.other_needs,

        parent_guardian_name: req.body.parent_guardian_name,
        parent_guardian_relationship: req.body.parent_guardian_relationship,

        permission_granted: req.body.permission_granted,
        permission_date: req.body.permission_date,

        terms_understood: req.body.terms_understood,
        media_consent_internal: req.body.media_consent_internal,
        media_consent_external: req.body.media_consent_external,
        media_release_understood: req.body.media_release_understood,

        form_completed_by: req.body.form_completed_by,
        date_completed: new Date(req.body.date_completed)
    };
    try {
        const response = await mongodb.getDatabase().db().collection('youth').replaceOne({ _id: youthId }, youth);
        if (response.modifiedCount > 0) {
            res.status(204).send();
        } else {
            res.status(500).json(response.error || 'Error occured while updating the youth registrations. No changes made.');

        }
    } catch (err) {
        console.error('Error updateYouth:', err);
        res.status(500).json({ message: `We encountered an error while updating the youth registration ${req.params.id}` });
    }
};

const createYouth = async (req, res) => {
    //#swagger.tags=['Youth']
    const youth = {
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

        medications: req.body.medications,
        medications_self_administer: req.body.medications_self_administer,
        medications_administer_description: req.body.medications_administer_description,
        medications_description: req.body.medications_description,

        health_conditions: req.body.health_conditions,
        health_conditions_description: req.body.health_conditions_description,
        surgery_recent: req.body.surgery_recent,
        surgery_description: req.body.surgery_description,
        physical_limitations: req.body.physical_limitations,
        other_needs: req.body.other_needs,

        parent_guardian_name: req.body.parent_guardian_name,
        parent_guardian_relationship: req.body.parent_guardian_relationship,

        permission_granted: req.body.permission_granted,
        permission_date: req.body.permission_date,

        terms_understood: req.body.terms_understood,
        media_consent_internal: req.body.media_consent_internal,
        media_consent_external: req.body.media_consent_external,
        media_release_understood: req.body.media_release_understood,

        form_completed_by: req.body.form_completed_by,
        date_completed: new Date()
    };

    try {
        const response = await mongodb.getDatabase().db().collection('youth').insertOne(youth);
        if (response.acknowledged) {
            res.status(201).send({ id: response.insertedId, ...youth });
        } else {
            res.status(500).json(response.error || 'An error occured while adding the youth registration. Registration was not recorded.');
        }
    } catch (err) {
        console.error('Error createYouth:', err);
        res.status(500).json({ message: `We encountered an error while creating the youth registration` });
    }
};

const deleteYouth = async (req, res) => {
    //#swagger.tags=['Youth']
    const youthId = new ObjectId(req.params.id);

    const response = await mongodb.getDatabase().db().collection('youth').deleteOne({ _id: youthId });
    if (response.deletedCount > 0) {
        res.status(204).send();
    } else {
        res.status(500).json(response.error || 'Error occured while deleting the youth registration.');

    }
};

module.exports = { getAllYouth, getYouth, getYouthByAge, getYouthByWard, getYouthByMedical, getYouthByAllergies, getYouthByFoodIssues, updateYouth, createYouth, deleteYouth }