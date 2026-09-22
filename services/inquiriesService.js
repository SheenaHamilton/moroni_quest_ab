const mongodb = require('../data/database');
const ObjectId = require('mongodb').ObjectId;

const col = () => mongodb.getDatabase().db().collection('inquiries');

const create = async ({ name, email, phone, subject, message }) => {
    const inquiry = {
        name,
        email,
        phone,
        subject,
        message,
        status: 'new',
        createdAt: new Date(),
    };

    return col().insertOne(inquiry);
};

const countByStatus = async (status) => col().countDocuments({ status });

const list = async ({ status = 'all' } = {}) => {
    const query = status === 'all' ? {} : { status };
    return col().find(query).toArray();
};

const getById = async (id) => col().findOne({ _id: new ObjectId(id) });

const setStatus = async (id, status) =>
    col().updateOne(
        { _id: new ObjectId(id) },
        { $set: { status, updatedAt: new Date() } }
    );

module.exports = {
    create,
    countByStatus,
    list,
    getById,
    setStatus,
};
