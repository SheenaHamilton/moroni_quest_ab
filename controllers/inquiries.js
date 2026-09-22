const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const renderInquiryForm = (req, res) => {
    res.render('inquiries', {
        success: req.query.success === '1',
        error: req.query.error || null,
        errors: null,
        form: null
    });
};

// Get all inquiries
const getAllInquiries = async (req, res) => {
    //#swagger.tags=['Inquiries']
    try {
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('inquiries')
            .find()
            .toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get inquiry by id
const getInquiryById = async (req, res) => {
    //#swagger.tags=['Inquiries']
    try {
        const inquiryId = new ObjectId(req.params.id);
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('inquiries')
            .findOne({ _id: inquiryId });
        if (!result) {
            return res.status(404).json({ message: 'Inquiry not found' });
        }
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get inquiries by status
const getInquiriesByStatus = async (req, res) => {
    //#swagger.tags=['Inquiries']
    try {
        const status = req.params.status;
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('inquiries')
            .find({ status: status })
            .toArray();
        res.setHeader('Content-Type', 'application/json');
        res.status(200).json(result);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Get inquiries count by status
const getInquiriesCountByStatus = async (req, res) => {
    //#swagger.tags=['Inquiries']
    try {
        const status = req.params.status;
        const count = await mongodb
            .getDatabase()
            .db()
            .collection('inquiries')
            .countDocuments({ status });

        res.setHeader('Content-Type', 'application/json');
        res.status(200).json({ status, count });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// Create new inquiry (used by public form)
const createInquiry = async (req, res) => {
    //#swagger.tags=['Inquiries']
    try {
        // If validation middleware attached errors for render
        if (req.validationErrors?.length) {
            return res.status(400).render('inquiries', {
                success: false,
                error: null,
                errors: req.validationErrors,
                form: req.body
            });
        }

        const inquiry = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            subject: req.body.subject,
            message: req.body.message,
            status: 'new',
            createdAt: new Date(),
        };
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('inquiries')
            .insertOne(inquiry);
        if (result.acknowledged) {
            //  redirect back to the same page with a success banner
            return res.redirect('/inquiries?success=1');
        }

        return res.status(500).render('inquiries', {
            success: false,
            error: 'Error creating inquiry. Please try again.',
            errors: null,
            form: req.body
        });
    } catch (err) {
        console.error(err);
        return res.status(500).render('inquiries', {
            success: false,
            error: 'Something went wrong. Please try again.',
            errors: null,
            form: req.body
        });
    }
};

// Update inquiry
const updateInquiry = async (req, res) => {
    //#swagger.tags=['Inquiries']
    try {
        const inquiryId = new ObjectId(req.params.id);
        const inquiry = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            subject: req.body.subject,
            message: req.body.message,
            status: req.body.status,
            updatedAt: new Date(),
        };
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('inquiries')
            .updateOne({ _id: inquiryId }, { $set: inquiry });
        if (result.modifiedCount > 0) {
            res.status(200).json({ message: 'Inquiry updated successfully' });
        } else {
            res.status(404).json({ message: 'Inquiry not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete inquiry
const deleteInquiry = async (req, res) => {
    //#swagger.tags=['Inquiries']
    try {
        const inquiryId = new ObjectId(req.params.id);
        const result = await mongodb
            .getDatabase()
            .db()
            .collection('inquiries')
            .deleteOne({ _id: inquiryId });
        if (result.deletedCount > 0) {
            res.status(200).json({ message: 'Inquiry deleted successfully' });
        } else {
            res.status(404).json({ message: 'Inquiry not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    renderInquiryForm,
    getAllInquiries,
    getInquiryById,
    getInquiriesByStatus,
    getInquiriesCountByStatus,
    createInquiry,
    updateInquiry,
    deleteInquiry,
};