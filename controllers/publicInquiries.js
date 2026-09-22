const inquiriesService = require('../services/inquiriesService');

const renderForm = (req, res) => {
    res.render('inquiries', {
        activePage: 'inquiries',
        success: req.query.success === '1',
        error: req.query.error || null,
        errors: null,
        form: null
    });
};

const submitForm = async (req, res) => {
    try {
        if (req.validationErrors?.length) {
            return res.status(400).render('inquiries', {
                success: false,
                error: null,
                errors: req.validationErrors,
                form: req.body
            });
        }

        const result = await inquiriesService.create(req.body);

        if (result.acknowledged) return res.redirect('/inquiries?success=1');

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

module.exports = { renderForm, submitForm };
