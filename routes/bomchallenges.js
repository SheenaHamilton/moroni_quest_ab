const router = require('express').Router();
const bomchallengesController = require('../controllers/bomchallenges');
const validate = require('../validation/bomchallengesValidation');
const { isAuthenticated } = require("../middleware/authenticate");

// Specific routes FIRST (before /:id route)
router.get('/by-book/:book', validate.validateBookParam(), validate.checkChallengeValidation, bomchallengesController.getChallengesByBook);

// Date Route
router.get('/by-schedule/:date', validate.validateDateParam(), validate.checkChallengeValidation, bomchallengesController.getChallengesBySchedule);

// ID route
router.get('/:id', bomchallengesController.getChallengeById);

// Get all
router.get('/', bomchallengesController.getAllChallenges);

// POST route
router.post('/', isAuthenticated, validate.validateChallenge(), validate.checkChallengeValidation, bomchallengesController.createChallenge);

// PUT route
router.put('/:id', isAuthenticated, validate.validateChallenge(), validate.checkChallengeValidation, bomchallengesController.updateChallenge);

// DELETE route
router.delete('/:id', isAuthenticated, bomchallengesController.deleteChallenge);


module.exports = router;