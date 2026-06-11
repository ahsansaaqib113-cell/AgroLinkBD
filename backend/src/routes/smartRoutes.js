const express = require('express');
const router = express.Router();
const {
  getWeatherAdvice,
  getMarketPrices,
  diagnoseCropDisease,
  getSmartRecommendations,
} = require('../controllers/smartController');
const { protect } = require('../middleware/authMiddleware');

router.get('/weather', getWeatherAdvice);
router.get('/prices', getMarketPrices);
router.get('/recommendations', getSmartRecommendations);

// Scanning requires login
router.post('/crop-scan', protect, diagnoseCropDisease);

module.exports = router;
