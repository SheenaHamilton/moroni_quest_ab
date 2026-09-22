const { body, param, validationResult } = require('express-validator');

const validate = {};

// Validate book parameter
validate.validateBookParam = () => {
    return [
        param('book')
            .trim()
            .notEmpty()
            .withMessage('Book name is required.')
            .isIn([
                '1 Nephi',
                '2 Nephi',
                'Jacob',
                'Enos',
                'Jarom',
                'Omni',
                'Words of Mormon',
                'Mosiah',
                'Alma',
                'Helaman',
                '3 Nephi',
                '4 Nephi',
                'Mormon',
                'Ether',
                'Moroni',
            ])
            .withMessage('Must be a valid Book of Mormon book name.')
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

// Validate challenge data
validate.validateChallenge = () => {
    return [
        body('title')
            .trim()
            .notEmpty()
            .withMessage('Title is required.')
            .isLength({ min: 3, max: 200 })
            .withMessage('Title must be between 3 and 200 characters.')
            .escape(),

        body('description')
            .optional({ checkFalsy: true })
            .trim()
            .isLength({ max: 1000 })
            .withMessage('Description must not exceed 1000 characters.')
            .escape(),

        body('book')
            .trim()
            .notEmpty()
            .withMessage('Book name is required.')
            .isIn([
                '1 Nephi',
                '2 Nephi',
                'Jacob',
                'Enos',
                'Jarom',
                'Omni',
                'Words of Mormon',
                'Mosiah',
                'Alma',
                'Helaman',
                '3 Nephi',
                '4 Nephi',
                'Mormon',
                'Ether',
                'Moroni',
            ])
            .withMessage('Must be a valid Book of Mormon book name.')
            .escape(),

        body('chapters')
            .optional({ checkFalsy: true })
            .trim()
            .matches(/^[\d\-,\s]+$/)
            .withMessage(
                'Chapters must be numbers separated by commas or dashes.'
            )
            .escape(),

        body('verses')
            .optional({ checkFalsy: true })
            .trim()
            .matches(/^[\d\-,\s:]+$/)
            .withMessage(
                'Verses must be numbers with colons, commas, or dashes.'
            )
            .escape(),

        body('startDate')
            .notEmpty()
            .withMessage('Start date is required.')
            .isISO8601()
            .toDate()
            .withMessage('Start date must be a valid date.'),

        body('endDate')
            .notEmpty()
            .withMessage('End date is required.')
            .isISO8601()
            .toDate()
            .withMessage('End date must be a valid date.')
            .custom((value, { req }) => {
                if (new Date(value) < new Date(req.body.startDate)) {
                    throw new Error('End date must be after start date.');
                }
                return true;
            }),

        body('points')
            .optional({ checkFalsy: true })
            .isInt({ min: 0, max: 10000 })
            .withMessage(
                'Points must be a positive integer between 0 and 10000.'
            ),
    ];
};

// Check challenge data and return errors or continue
validate.checkChallengeValidation = async (req, res, next) => {
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Error checkChallengeValidation:', errors);
        res.status(400).json({
            message:
                'We encountered an error validating challenge data: ' +
                errors.array()[0].msg,
        });
        return;
    }
    next();
};

module.exports = validate;