const { body, query, validationResult } = require('express-validator');

const validate = {};

// Validate leader data  
validate.validateLeader = () => {
    return [
        // Basic Info
        body('email')
            .trim()
            .notEmpty().withMessage('Email is required.')
            .isEmail().withMessage('Must be a valid email address.')
            .normalizeEmail(),

        body('first_name')
            .trim()
            .notEmpty().withMessage('First name is required.')
            .isAlpha('en-US', { ignore: " -'" }).withMessage('First name must contain only letters.')
            .escape(),

        body('last_name')
            .trim()
            .notEmpty().withMessage('Last name is required.')
            .isAlpha('en-US', { ignore: " -'" }).withMessage('Last name must contain only letters.')
            .escape(),

        body('ward')
            .trim()
            .notEmpty().withMessage('Ward or branch is required.')
            .escape(),

        body('birthdate')
            .notEmpty().withMessage('Birthdate is required.')
            .isISO8601().toDate().withMessage('Birthdate must be a valid date.'),

        // Address
        body('address_street')
            .trim()
            .notEmpty().withMessage('Street address is required.')
            .escape(),

        body('address_city')
            .trim()
            .notEmpty().withMessage('City is required.')
            .escape(),

        body('address_province')
            .trim()
            .notEmpty().withMessage('Province is required.')
            .isLength({ min: 2, max: 2 }).withMessage('Province should use a 2-letter code.')
            .escape(),

        body('address_postal')
            .trim()
            .notEmpty().withMessage('Postal code is required.')
            .matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/)
            .withMessage('Postal code must be a valid Canadian postal code.')
            .escape(),

        // Emergency Contacts
        body('emergency_contact_name')
            .trim()
            .notEmpty().withMessage('Emergency contact name is required.')
            .escape(),

        body('emergency_contact_primary')
            .trim()
            .notEmpty().withMessage('Primary emergency contact phone is required.')
            .matches(/^[0-9\-+()\s]{7,20}$/)
            .withMessage('Enter a valid phone number.')
            .escape(),

        body('emergency_contact_secondary')
            .optional({ checkFalsy: true })
            .matches(/^[0-9\-+()\s]{7,20}$/)
            .withMessage('Enter a valid secondary phone number.')
            .escape(),

        // Health
        body('health_number')
            .trim()
            .notEmpty().withMessage('Health number is required.')
            .matches(/^[A-Za-z0-9-]+$/)
            .withMessage('Enter a valid health number.')
            .escape(),

        body('diet_specific')
            .isBoolean().withMessage('Diet-specific field must be true or false.'),

        body('diet_description')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('allergies')
            .isBoolean().withMessage('Allergies field must be true or false.'),

        body('allergies_description')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        //role and sleeping arrangements
        body('role')
            .trim()
            .notEmpty()
            .withMessage('Leader role is required.')
            .isString()
            .withMessage('Leader role must be a valid string.')
            .escape(),

        body('arrival_date')
            .notEmpty()
            .withMessage('Arrival date is required.')
            .isISO8601()
            .withMessage('Arrival date must be a valid ISO date.')
            .toDate(),

        body('departure_date')
            .notEmpty()
            .withMessage('Departure date is required.')
            .isISO8601()
            .withMessage('Departure date must be a valid ISO date.')
            .toDate(),

        body('lodging_type')
            .trim()
            .notEmpty()
            .withMessage('Lodging type is required.')
            .isIn(['camper', 'tent', 'assigned', 'not_staying'])
            .withMessage('Lodging type must be one of: camper, tent, assigned or not staying.')
            .escape(),

        body('lodging_description')
            .optional({ checkFalsy: true })
            .trim()
            .isString()
            .withMessage('Lodging description must be a valid string.')
            .escape(),

        body('terms_understood')
            .isBoolean().withMessage('Terms understood must be true or false.'),

        body('media_consent_internal')
            .isBoolean().withMessage('Internal media consent must be true or false.'),

        body('media_consent_external')
            .isBoolean().withMessage('External media consent must be true or false.'),

        body('media_release_understood')
            .isBoolean().withMessage('Media release understood must be true or false.'),

        // Form Completion
        body('form_completed_by')
            .trim()
            .notEmpty().withMessage('Form completed by name is required.')
            .escape()

    ]
};
// Validate lodging data  
validate.validateGetLodging = () => {
    return [
        query('lodging_type')
            .trim()
            .notEmpty()
            .withMessage('Lodging type is required.')
            .isIn(['camper', 'tent', 'assigned', 'not_staying'])
            .withMessage('Lodging type must be one of: camper, tent, assigned or not staying.')
            .escape()
    ]
};

// Check leader data and return errors or continue to modify/add the leader
validate.checkLeaderValidation = async (req, res, next) => {
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Error checkLeaderValidation:', errors);
        res.status(400).json({ message: `We encountered an error validating: ` + errors.array()[0].msg });
        return
    }
    next()
};

module.exports = validate;