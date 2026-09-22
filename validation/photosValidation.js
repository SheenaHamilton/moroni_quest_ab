const { body, param, validationResult } = require('express-validator');

const validate = {};

// Validate event parameter
validate.validateEventParam = () => {
    return [
        param('event')
            .trim()
            .notEmpty()
            .withMessage('Event name is required.')
            .escape(),
    ];
};

// Validate date parameter
validate.validateDateParam = () => {
    return [
        param('date')
            .notEmpty()
            .withMessage('Date is required.')
            .isISO8601()
            .withMessage('Date must be a valid date.'),
    ];
};

// Validate photo data
validate.validatePhoto = () => {
    return [
        body('url')
            .trim()
            .notEmpty()
            .withMessage('URL is required.')
            .isURL()
            .withMessage('Must be a valid URL.'),

        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required.')
            .isLength({ min: 3, max: 100 })
            .withMessage('Title must be between 3 and 100 characters.')
            .escape(),

        body('description')
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 500 })
            .withMessage('Description must not exceed 500 characters.')
            .escape(),

        body('event')
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 100 })
            .withMessage('Event name must not exceed 100 characters.')
            .escape(),

        body('date')
            .optional({ checkFalsy: true })
            .isISO8601()
            .toDate()
            .withMessage('Date must be a valid date.'),

        body('uploadedBy')
            .trim()
            .notEmpty()
            .withMessage('Uploaded by is required.')
            .isLength({ min: 2, max: 100 })
            .withMessage('Uploaded by must be between 2 and 100 characters.')
            .escape(),
    ];
};

// Check photo data and return errors or continue
validate.checkPhotoValidation = async (req, res, next) => {
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Error checkPhotoValidation:', errors);
        res.status(400).json({
            message:
                'We encountered an error validating photo data: ' +
                errors.array()[0].msg,
        });
        return;
    }
    next();
};

module.exports = validate;