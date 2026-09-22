const router = require('express').Router();

const leaderController = require('../controllers/leader');
const validate = require('../validation/leaderValidation');
const { isAuthenticated } = require("../middleware/authenticate");

router.get('/by-allergies', isAuthenticated, leaderController.getLeaderByAllergies);

router.get('/by-food', isAuthenticated, leaderController.getLeaderByFoodIssues);

router.get('/by-sleep', isAuthenticated, validate.validateGetLodging(), validate.checkLeaderValidation, leaderController.getLeaderBySleepingArrangement);

router.get('/:id', isAuthenticated, leaderController.getLeader);

router.get('/', isAuthenticated, leaderController.getAllLeaders);

router.post('/', isAuthenticated, validate.validateLeader(), validate.checkLeaderValidation, leaderController.createLeader);

router.put('/:id', isAuthenticated, validate.validateLeader(), validate.checkLeaderValidation, leaderController.updateLeader);

router.delete('/:id', isAuthenticated, leaderController.deleteLeader);

module.exports = router;