const { body, validationResult } = require("express-validator");

const registerValidation = {};

const yesNoToBool = (v) => {
    if (typeof v !== "string") return v;
    const s = v.trim().toLowerCase();
    if (s === "yes") return true;
    if (s === "no") return false;
    return v;
};

// Checkbox values:
// - checked => "true" (string) OR "on" OR "true"
// - unchecked => undefined (missing)
const checkboxToBool = (v) => {
    if (v === undefined) return false;
    if (typeof v === "boolean") return v;
    const s = String(v).toLowerCase();
    return s === "true" || s === "on" || s === "1";
};

const isYouth = (req) => req.body.registration_type === "youth";
const isLeader = (req) => req.body.registration_type === "leader";

registerValidation.validateRegistration = () => {
    return [
        // --- Registration type ---
        body("registration_type")
            .trim()
            .notEmpty().withMessage("Registration type is required.")
            .isIn(["youth", "leader"]).withMessage("Registration type must be youth or leader."),

        // --- Shared participant info ---
        body("first_name")
            .trim()
            .notEmpty().withMessage("Participant Information: First name is required.")
            .isAlpha("en-US", { ignore: " -'" }).withMessage("Participant Information: First name must contain only letters."),

        body("last_name")
            .trim()
            .notEmpty().withMessage("Participant Information: Last name is required.")
            .isAlpha("en-US", { ignore: " -'" }).withMessage("Participant Information: Last name must contain only letters."),

        body("birthdate")
            .notEmpty().withMessage("Participant Information: Birthdate is required.")
            .isISO8601({ strict: true, strictSeparator: true })
            .withMessage("Participant Information: Birthdate must be a valid date.")
            .toDate(),

        body("gender")
            .trim()
            .notEmpty().withMessage("Participant Information: Gender is required.")
            .isIn(["male", "female"]).withMessage("Participant Information: Gender must be male or female."),

        body("email")
            .trim()
            .notEmpty().withMessage("Participant Information: Email is required.")
            .isEmail().withMessage("Participant Information: Email must be a valid email address.")
            .bail()
            .normalizeEmail({ gmail_remove_dots: false }),

        body("parent_email")
            .if((_, { req }) => isYouth(req))
            .optional({ checkFalsy: true })
            .trim()
            .isEmail().withMessage("Participant Information: Parent email must be a valid email address.")
            .bail()
            .normalizeEmail({ gmail_remove_dots: false }),

        body("friend_request")
            .optional({ checkFalsy: true })
            .trim(),

        body("ward")
            .trim()
            .notEmpty().withMessage("Participant Information: Ward / branch is required."),

        // --- Address (note: province mismatch fix below) ---
        body("address_street")
            .trim()
            .notEmpty().withMessage("Participant Information: Street Address is required."),

        body("address_city")
            .trim()
            .notEmpty().withMessage("Participant Information: City is required."),

        // OPTION A: enforce AB only (recommended)
        // body("address_province")
        //   .trim()
        //   .notEmpty().withMessage("Province is required.")
        //   .isIn(["AB"]).withMessage("Province must be AB.")
        //   .escape(),

        // OPTION B: accept "British Columbia" or "BC" (works with your current form value)
        body("address_province")
            .trim()
            .notEmpty().withMessage("Participant Information: Province is required.")
            .customSanitizer((v) => {
                const s = String(v).trim().toLowerCase();
                if (s === "british columbia") return "BC";
                if (s === "bc") return "BC";
                return v;
            })
            .isIn(["BC"]).withMessage("Participant Information: Province must be in BC."),

        body("address_postal")
            .trim()
            .notEmpty().withMessage("Participant Information: Postal code is required.")
            .matches(/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/)
            .withMessage("Participant Information: Postal code must be a valid Canadian postal code."),

        // --- Emergency Contact ---
        body("emergency_contact_name")
            .trim()
            .notEmpty().withMessage("Emergency Contact: Emergency contact name is required."),

        body("emergency_contact_primary")
            .trim()
            .notEmpty().withMessage("Emergency Contact: Primary emergency contact phone is required.")
            .matches(/^[0-9\-+()\s]{7,20}$/).withMessage("Emergency Contact: Enter a valid phone number."),

        body("emergency_contact_secondary")
            .optional({ checkFalsy: true })
            .matches(/^[0-9\-+()\s]{7,20}$/).withMessage("Emergency Contact: Enter a valid secondary phone number."),

        // --- Health & dietary (shared) ---
        body("health_number")
            .trim(),

        body("diet_specific")
            .customSanitizer(yesNoToBool)
            .isBoolean().withMessage("Health & Dietary: Dietary selection is required.")
            .bail()
            .toBoolean(),

        body("diet_description")
            .if((_, { req }) => req.body.diet_specific === true)
            .trim()
            .notEmpty().withMessage("Health & Dietary: Please describe dietary needs."),


        body("allergies")
            .customSanitizer(yesNoToBool)
            .isBoolean().withMessage("Health & Dietary: Allergies selection is required.")
            .bail()
            .toBoolean(),

        body("allergies_description")
            .if((_, { req }) => req.body.allergies === true)
            .trim()
            .notEmpty().withMessage("Health & Dietary: Please list allergies."),

        // --- Youth-only fields ---
        body("medications")
            .if((_, { req }) => isYouth(req))
            .customSanitizer(yesNoToBool)
            .notEmpty().withMessage("Youth Medical & Permission: Medications selection is required.")
            .bail()
            .isBoolean().withMessage("Youth Medical & Permission: Medications selection is required.")
            .bail()
            .toBoolean(),

        body("medications_description")
            .if((_, { req }) => isYouth(req) && req.body.medications === true)
            .trim()
            .notEmpty().withMessage("Youth Medical & Permission: Please list medications and instructions."),

        body("medications_self_administer")
            .if((_, { req }) => isYouth(req) && req.body.medications === true)
            .customSanitizer(yesNoToBool)
            .notEmpty().withMessage("Youth Medical & Permission: Self-administer selection is required.")
            .bail()
            .isBoolean().withMessage("Youth Medical & Permission: Self-administer selection is required.")
            .bail()
            .toBoolean(),

        body("medications_administer_description")
            .if((_, { req }) =>
                isYouth(req) &&
                req.body.medications === true &&
                req.body.medications_self_administer === false
            )
            .trim()
            .notEmpty().withMessage("Youth Medical & Permission: Please describe who should administer medications and how."),

        body("health_conditions")
            .if((_, { req }) => isYouth(req))
            .customSanitizer(yesNoToBool)
            .notEmpty().withMessage("Youth Medical & Permission: Health Conditions selection is required.")
            .bail()
            .isBoolean().withMessage("Youth Medical & Permission: Health Conditions selection is required.")
            .bail()
            .toBoolean(),

        body("health_conditions_description")
            .if((_, { req }) => isYouth(req) && req.body.health_conditions === true)
            .trim()
            .notEmpty().withMessage("Youth Medical & Permission: Please describe health conditions."),


        body("surgery_recent")
            .if((_, { req }) => isYouth(req))
            .customSanitizer(yesNoToBool)
            .notEmpty().withMessage("Youth Medical & Permission: Recent Surgery selection is required.")
            .bail()
            .isBoolean().withMessage("Youth Medical & Permission: Recent Surgery selection is required.")
            .bail()
            .toBoolean(),

        body("surgery_description")
            .if((_, { req }) => isYouth(req) && req.body.surgery_recent === true)
            .trim()
            .notEmpty().withMessage("Youth Medical & Permission: Please describe the surgery/procedure."),

        body("physical_limitations")
            .if((_, { req }) => isYouth(req))
            .optional({ checkFalsy: true })
            .trim(),

        body("other_needs")
            .if((_, { req }) => isYouth(req))
            .optional({ checkFalsy: true })
            .trim(),

        body("parent_guardian_name")
            .if((_, { req }) => isYouth(req))
            .trim()
            .notEmpty().withMessage("Youth Medical & Permission: Parent/guardian name is required."),

        body("parent_guardian_relationship")
            .if((_, { req }) => isYouth(req))
            .trim()
            .notEmpty().withMessage("Youth Medical & Permission: Parent/guardian relationship is required."),

        body("permission_granted")
            .if((_, { req }) => isYouth(req))
            .exists({ checkFalsy: true })
            .withMessage("Youth Medical & Permission: Parent / guardian permission is required.")
            .bail()
            .customSanitizer(checkboxToBool)
            .custom((v) => v === true)
            .withMessage("Youth Medical & Permission: Parent / guardian permission is required."),

        body("permission_granted_privilege")
            .if((_, { req }) => isYouth(req))
            .exists({ checkFalsy: true })
            .withMessage("Youth Medical & Permission: Parent/guardian acknowledgement of participant conduct is required.")
            .bail()
            .customSanitizer(checkboxToBool)
            .custom((v) => v === true)
            .withMessage("Youth Medical & Permission: Parent/guardian acknowledgement of participant conduct is required."),

        body("permission_date")
            .if((_, { req }) => isYouth(req))
            .notEmpty().withMessage("Youth Medical & Permission: Permission date is required.")
            .isISO8601().withMessage("Youth Medical & Permission: Permission date must be valid.")
            .toDate(),

        body("youth_acknowledgement_privilege")
            .if((_, { req }) => isYouth(req))
            .exists({ checkFalsy: true })
            .withMessage("Youth Medical & Permission: Youth participant acknowledgement of conduct is required.")
            .bail()
            .customSanitizer(checkboxToBool)
            .custom((v) => v === true)
            .withMessage("Youth Medical & Permission: Youth participant acknowledgement of conduct is required."),

        body("youth_acknowledgement")
            .if((_, { req }) => isYouth(req))
            .exists({ checkFalsy: true })
            .withMessage("Youth Medical & Permission: Youth participant understanding of terms is required.")
            .bail()
            .customSanitizer(checkboxToBool)
            .custom((v) => v === true)
            .withMessage("Youth Medical & Permission: Youth participant understanding of terms is required."),

        // --- Leader-only fields ---
        body("role")
            .if((_, { req }) => isLeader(req))
            .trim()
            .notEmpty().withMessage("Leader Role & Lodging: Leader role is required."),

        body("arrival_date")
            .if((_, { req }) => isLeader(req))
            .notEmpty().withMessage("Leader Role & Lodging: Arrival date is required.")
            .isISO8601().withMessage("Leader Role & Lodging: Arrival date must be valid.")
            .toDate(),

        body("departure_date")
            .if((_, { req }) => isLeader(req))
            .notEmpty().withMessage("Leader Role & Lodging: Departure date is required.")
            .isISO8601().withMessage("Leader Role & Lodging: Departure date must be valid.")
            .toDate(),

        body("medical_background")
            .if((_, { req }) => isLeader(req))
            .customSanitizer(yesNoToBool)
            .notEmpty().withMessage("Leader Role & Lodging: Medical Background selection is required.")
            .bail()
            .isBoolean().withMessage("Leader Role & Lodging: Medical Background selection is required.")
            .bail()
            .toBoolean(),

        body("medical_background_description")
            .if((_, { req }) => isLeader(req) && req.body.medical_background === true)
            .trim()
            .notEmpty().withMessage("Leader Role & Lodging: Please describe your medical or first-aid background."),

        body("lodging_type")
            .if((_, { req }) => isLeader(req))
            .trim()
            .notEmpty().withMessage("Leader Role & Lodging: Lodging preference is required."),

        body("lodging_description")
            .if((_, { req }) => isLeader(req))
            .optional({ checkFalsy: true })
            .trim(),


        // --- Terms & Media (checkboxes) ---
        body("media_consent_internal")
            .customSanitizer(checkboxToBool)
            .toBoolean(),

        body("media_release_understood")
            .exists({ checkFalsy: true })
            .withMessage("Terms & Media Consents: Media release acknowledgement is required.")
            .bail()
            .customSanitizer(checkboxToBool)
            .custom((v) => v === true)
            .withMessage("Terms & Media Consents: Media release acknowledgement is required."),

        body("form_completed_by")
            .trim()
            .notEmpty().withMessage("Final Confirmation: Form completed by name is required."),

        body("terms_understood")
            .exists({ checkFalsy: true })
            .withMessage("Final Confirmation: Terms acknowledgement is required.")
            .bail()
            .customSanitizer(checkboxToBool)
            .custom((v) => v === true)
            .withMessage("Final Confirmation: Terms acknowledgement is required."),

    ];
};

registerValidation.checkRegistrationValidation = (req, res, next) => {
    const result = validationResult(req);

    if (!result.isEmpty()) {
        const firstError = result.array({ onlyFirstError: true })[0];

        return res.status(400).render("register", {
            activePage: "register",
            errorSummary: [firstError.msg], // ONE message only
            errors: {},
            values: { ...req.body }         // keep values for later
        });
    }

    next();
};


// registerValidation.checkRegistrationValidation = (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         const errorsArray = errors.array({ onlyFirstError: true });

//         // Map errors by field so you can show messages beside inputs
//         const errorsMapped = {};
//         errorsArray.forEach((e) => {
//             if (!errorsMapped[e.path]) errorsMapped[e.path] = e.msg;
//         });

//         // Keep their form values so they don't have to retype
//         const values = { ...req.body };

//         // For website forms, 400 is better than 500
//         return res.status(400).render("register", {
//             title: "Registration",
//             stake: res.locals.stake || req.app.locals.stake || "", // adjust if needed
//             errors,
//             errorSummary: errorsArray.map((e) => e.msg),
//             values,
//         });
//     }
//     next();
// };

module.exports = registerValidation;
