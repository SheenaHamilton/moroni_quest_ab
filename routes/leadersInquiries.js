const router = require('express').Router();
const { requireLeader } = require('../middleware/pageAuth');
const leaderInquiries = require('../controllers/leaderInquiries');

router.get('/inquiries', requireLeader, leaderInquiries.renderListPage);
router.post('/inquiries/:id/next', requireLeader, leaderInquiries.advanceStatus);

module.exports = router;
