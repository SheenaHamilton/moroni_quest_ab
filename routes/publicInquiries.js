const router = require('express').Router();
const publicInquiries = require('../controllers/publicInquiries');
const validate = require('../validation/inquiriesValidation');
const inquiryProtection = require('../middleware/inquiryProtection');

router.get('/', publicInquiries.renderForm);
router.post(
    '/',
    inquiryProtection.rateLimit,
    inquiryProtection.verify,
    validate.validateInquiry(),
    validate.checkInquiryValidation,
    publicInquiries.submitForm
);

module.exports = router;
