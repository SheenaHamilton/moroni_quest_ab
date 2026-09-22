const router = require('express').Router();
const publicInquiries = require('../controllers/publicInquiries');
const validate = require('../validation/inquiriesValidation');

router.get('/', publicInquiries.renderForm);
router.post('/', validate.validateInquiry(), validate.checkInquiryValidation, publicInquiries.submitForm);

module.exports = router;
