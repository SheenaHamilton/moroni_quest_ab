const router = require('express').Router();
const photosController = require('../controllers/photos');
const validate = require('../validation/photosValidation');
const { isAuthenticated } = require("../middleware/authenticate");

// Specific routes FIRST (before /:id route)
router.get('/by-event/:event', validate.validateEventParam(), validate.checkPhotoValidation, photosController.getPhotosByEvent);

router.get('/by-date/:date', validate.validateDateParam(), validate.checkPhotoValidation, photosController.getPhotosByDate);

// ID route
router.get('/:id', photosController.getPhotoById);

// Get all
router.get('/', photosController.getAllPhotos);

// POST route
router.post('/', isAuthenticated, validate.validatePhoto(), validate.checkPhotoValidation, photosController.createPhoto);

// PUT route
router.put('/:id', isAuthenticated, validate.validatePhoto(), validate.checkPhotoValidation, photosController.updatePhoto);

// DELETE route
router.delete('/:id', isAuthenticated, photosController.deletePhoto);

module.exports = router;