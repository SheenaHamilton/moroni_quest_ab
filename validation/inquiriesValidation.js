const { body, param, validationResult } = require('express-validator');

const validate = {};

// Validate status parameter
validate.validateStatusParam = () => {
    return [
        param('status')
            .trim()
            .notEmpty()
            .withMessage('Status is required.')
            .isIn(['pending', 'in-progress', 'resolved', 'closed'])
            .withMessage(
                'Status must be one of: pending, in-progress, resolved, closed.'
            )
            .escape(),
    ];
};

// Validate inquiry data
validate.validateInquiry = () => {
    return [
        body('name')
            .trim()
            .notEmpty()
            .withMessage('Name is required.')
            .isLength({ min: 2, max: 100 })
            .withMessage('Name must be between 2 and 100 characters.')
            .escape(),

        body('email')
            .trim()
            .notEmpty()
            .withMessage('Email is required.')
            .isEmail()
            .withMessage('Must be a valid email address.')
            .normalizeEmail({ gmail_remove_dots: false }),

        body('phone')
            .optional({ checkFalsy: true })
            .trim()
            .matches(/^[0-9\-+()\s]{7,20}$/)
            .withMessage('Enter a valid phone number.')
            .escape(),

        body('subject')
            .trim()
            .notEmpty()
            .withMessage('Subject is required.')
            .isLength({ min: 3, max: 200 })
            .withMessage('Subject must be between 3 and 200 characters.')
            .escape(),

        body('message')
            .trim()
            .notEmpty()
            .withMessage('Message is required.')
            .isLength({ min: 10, max: 2000 })
            .withMessage('Message must be between 10 and 2000 characters.')
            .escape(),

        body('status')
            .optional({ checkFalsy: true })
            .trim()
            .isIn(['pending', 'in-progress', 'resolved', 'closed'])
            .withMessage(
                'Status must be one of: pending, in-progress, resolved, closed.'
            )
            .escape(),
    ];
};

// Check inquiry data and return errors or continue
validate.checkInquiryValidation = async (req, res, next) => {
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        req.validationErrors = errors.array();
        return next();
    }
    next();
};

module.exports = validate;