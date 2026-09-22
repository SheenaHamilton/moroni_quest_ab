const router = require('express').Router();
const inquiriesController = require('../controllers/inquiries');
const validate = require('../validation/inquiriesValidation');
const { isAuthenticated } = require("../middleware/authenticate");

// Public form page (no login)
router.get('/', inquiriesController.renderInquiryForm);

// Specific routes FIRST (before /:id route)
router.get('/by-status/:status', isAuthenticated, validate.validateStatusParam(), validate.checkInquiryValidation, inquiriesController.getInquiriesByStatus);

// Get New Count
router.get('/count/:status', isAuthenticated, validate.validateStatusParam(), inquiriesController.getInquiriesCountByStatus);

// Get all
router.get('/all', isAuthenticated, inquiriesController.getAllInquiries);

// ID route
router.get('/:id', isAuthenticated, inquiriesController.getInquiryById);

// POST route
router.post('/', validate.validateInquiry(), validate.checkInquiryValidation, inquiriesController.createInquiry);

// PUT route
router.put('/:id', isAuthenticated, validate.validateInquiry(), validate.checkInquiryValidation, inquiriesController.updateInquiry);

// DELETE route
router.delete('/:id', isAuthenticated, inquiriesController.deleteInquiry);

module.exports = router;