const router = require('express').Router();
const registerController = require("../controllers/register");
const validateRegister = require("../validation/registerValidation");

router.get("/success", (req, res) => {
    const id = req.query.id || null;

    res.render("register-success", {
        activePage: 'register',
        title: "Registration Submitted",
        id,
    });
});

router.get('/', (req, res) => {
    res.render('register', {
        activePage: 'register',
        errorSummary: [],
        errors: {},
        values: {}
    });
});

router.post(
    "/",
    validateRegister.validateRegistration(),
    validateRegister.checkRegistrationValidation,
    registerController.submitRegistration
);

module.exports = router;
