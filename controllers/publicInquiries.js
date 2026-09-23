const inquiriesService = require('../services/inquiriesService');
const { issueChallenge } = require('../middleware/inquiryProtection');

const viewData = (req, overrides = {}) => ({
    activePage: 'inquiries',
    success: false,
    error: null,
    errors: null,
    form: null,
    challengeQuestion: req.inquiryChallengeQuestion || issueChallenge(req),
    ...overrides,
});

const renderForm = (req, res) => {
    res.render('inquiries', viewData(req, {
        success: req.query.success === '1',
        error: req.query.error || null,
    }));
};

const submitForm = async (req, res) => {
    try {
        if (req.inquiryProtectionError) {
            return res.status(400).render('inquiries', viewData(req, {
                errors: [{ msg: req.inquiryProtectionError }],
                form: req.body,
            }));
        }

        if (req.validationErrors?.length) {
            return res.status(400).render('inquiries', viewData(req, {
                errors: req.validationErrors,
                form: req.body,
            }));
        }

        const result = await inquiriesService.create(req.body);

        if (result.acknowledged) return res.redirect('/inquiries?success=1');

        return res.status(500).render('inquiries', viewData(req, {
            error: 'Error creating inquiry. Please try again.',
            form: req.body,
        }));
    } catch (err) {
        console.error(err);
        return res.status(500).render('inquiries', viewData(req, {
            error: 'Something went wrong. Please try again.',
            form: req.body,
        }));
    }
};

module.exports = { renderForm, submitForm };
