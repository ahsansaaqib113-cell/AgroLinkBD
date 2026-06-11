const express = require('express');
const router = express.Router();
const {
  getFarmerAnalytics,
  getAdminAnalytics,
  getBusinessAnalytics,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleGuard');

router.get('/farmer', protect, authorize('farmer'), getFarmerAnalytics);
router.get('/admin', protect, authorize('admin'), getAdminAnalytics);
router.get('/business', protect, authorize('business'), getBusinessAnalytics);

module.exports = router;
