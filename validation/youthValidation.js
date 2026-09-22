const { body, query, validationResult } = require('express-validator');

const validate = {};

validate.validateAgeParams = () => {
    return [
        query('min')
            .trim()
            .notEmpty().withMessage('Minimum age is required.')
            .isInt({ min: 0, max: 19 }).withMessage('Minimum age must be a valid number between 0 and 19.')
            .toInt(),

        query('max')
            .trim()
            .notEmpty().withMessage('Maximum age is required.')
            .isInt({ min: 0, max: 19 }).withMessage('Maximum age must be a valid number between 0 and 19.')
            .toInt(),

        // ensure min < max
        query('max').custom((value, { req }) => {
            if (parseInt(value) < parseInt(req.query.min)) {
                throw new Error('Maximum age must be greater than or equal to minimum age.');
            }
            return true;
        })
    ];
};

// Validate youth data  
validate.validateYouth = () => {
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

        body('medications')
            .isBoolean().withMessage('Medications field must be true or false.'),

        body('medications_self_administer')
            .isBoolean().withMessage('Medication self-administer field must be true or false.'),

        body('medications_administer_description')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('medications_description')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('health_conditions')
            .isBoolean().withMessage('Health conditions field must be true or false.'),

        body('health_conditions_description')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('surgery_recent')
            .isBoolean().withMessage('Surgery recent field must be true or false.'),

        body('surgery_description')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('physical_limitations')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        body('other_needs')
            .optional({ checkFalsy: true })
            .trim()
            .escape(),

        // Parent/Guardian Info
        body('parent_guardian_name')
            .trim()
            .notEmpty().withMessage('Parent or guardian name is required.')
            .escape(),

        body('parent_guardian_relationship')
            .trim()
            .notEmpty().withMessage('Relationship to participant is required.')
            .escape(),

        // Permissions & Media
        body('permission_granted')
            .isBoolean().withMessage('Permission granted must be true or false.'),

        body('permission_date')
            .optional({ checkFalsy: true })
            .isISO8601().toDate().withMessage('Permission date must be valid.')
            .notEmpty().withMessage('Permission date is required.'),

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

// Check youth data and return errors or continue to modify/add the youth
validate.checkYouthValidation = async (req, res, next) => {
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Error checkYouthValidation:', errors);
        res.status(500).json({ message: `We encountered an error validating youth registration: ` + errors.array()[0].msg });
        return
    }
    next()
};

// Check the parameters passed in for the age range are validated.
validate.checkYouthAgeValidation = async (req, res, next) => {
    let errors = [];
    errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('Error checkYouthAgeValidation:', errors);
        res.status(400).json({ message: `We encountered an error validating the age range requested: ` + errors.array()[0].msg });
        return
    }
    next()
};

module.exports = validate;