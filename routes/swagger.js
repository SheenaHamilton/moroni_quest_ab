const router = require('express').Router();
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('../swagger.json');
const helmet = require('helmet');

// Apply relaxed security headers only on /api-docs
// disable CSP for this route only
router.use('/api-docs', helmet({ contentSecurityPolicy: false, }), swaggerUi.serve,);
router.get('/api-docs', swaggerUi.setup(swaggerDoc));

module.exports = router;
