const router = require('express').Router();

const youthController = require('../controllers/youth');
const validate = require('../validation/youthValidation');
const { isAuthenticated } = require("../middleware/authenticate");

router.get('/by-age', isAuthenticated, validate.validateAgeParams(), validate.checkYouthAgeValidation, youthController.getYouthByAge);

router.get('/by-ward', isAuthenticated, youthController.getYouthByWard);

router.get('/by-medical', isAuthenticated, youthController.getYouthByMedical);

router.get('/by-allergies', isAuthenticated, youthController.getYouthByAllergies);

router.get('/by-food', isAuthenticated, youthController.getYouthByFoodIssues);

router.get('/:id', isAuthenticated, youthController.getYouth);

router.get('/', isAuthenticated, youthController.getAllYouth);

router.post('/', isAuthenticated, validate.validateYouth(), validate.checkYouthValidation, youthController.createYouth);

router.put('/:id', isAuthenticated, validate.validateYouth(), validate.checkYouthValidation, youthController.updateYouth);

router.delete('/:id', isAuthenticated, youthController.deleteYouth);

module.exports = router;