const Product = require('../models/Product');

// @desc    Get agricultural weather advice for a district
// @route   GET /api/smart/weather
// @access  Public
const getWeatherAdvice = async (req, res, next) => {
  try {
    const district = req.query.district || 'Dhaka';

    // Simulated agricultural weather matrix
    const weatherData = {
      Dhaka: { temp: 32, humidity: 75, condition: 'Sunny', wind: 12, rainChance: '10%', advice: 'Ideal weather for drying paddy. Ensure adequate soil irrigation in vegetable nurseries.' },
      Rajshahi: { temp: 36, humidity: 55, condition: 'Hot & Dry', wind: 14, rainChance: '5%', advice: 'Heatwave alert. Mulch around mango tree roots to retain moisture. Irrigate early in the morning.' },
      Sylhet: { temp: 28, humidity: 90, condition: 'Heavy Rain', wind: 18, rainChance: '85%', advice: 'High risk of waterlogging. Secure drainage channels in tea gardens and vegetable seedbeds.' },
      Chittagong: { temp: 30, humidity: 82, condition: 'Scattered Showers', wind: 15, rainChance: '50%', advice: 'Intermittent rain. Delay pesticide sprays. Suitable time for ginger and turmeric planting.' },
      Barisal: { temp: 29, humidity: 88, condition: 'Cloudy', wind: 16, rainChance: '40%', advice: 'Humid conditions. Monitor betel leaf plants for fungal rot. Clear drainage in guava orchards.' },
      Khulna: { temp: 31, humidity: 80, condition: 'Partly Cloudy', wind: 14, rainChance: '25%', advice: 'Optimal salinity conditions for shrimp farms. Check dikes for stability before high tides.' },
      Rangpur: { temp: 33, humidity: 65, condition: 'Pleasant', wind: 10, rainChance: '15%', advice: 'Excellent for maize harvesting. Suitable weather for organic composting operations.' },
      Mymensingh: { temp: 31, humidity: 78, condition: 'Humid', wind: 11, rainChance: '30%', advice: 'Monitor rice nurseries for brown planthopper activity. Keep water levels at 2-3 cm.' },
    };

    const details = weatherData[district] || weatherData['Dhaka'];

    res.json({
      success: true,
      district,
      ...details,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get daily commodity price comparisons (Middlemen vs AgroLink)
// @route   GET /api/smart/prices
// @access  Public
const getMarketPrices = async (req, res, next) => {
  try {
    // Current transparent market pricing in Bangladesh (BDT/kg or BDT/unit)
    const prices = [
      { name: 'Miniket Rice', unit: 'maund', traditionalFarmer: 1400, agroLinkFarmer: 1750, consumerRetail: 2100, demand: 'High' },
      { name: 'Deshi Potato', unit: 'kg', traditionalFarmer: 18, agroLinkFarmer: 28, consumerRetail: 38, demand: 'Stable' },
      { name: 'Red Tomato', unit: 'kg', traditionalFarmer: 25, agroLinkFarmer: 45, consumerRetail: 65, demand: 'High' },
      { name: 'Local Onion', unit: 'kg', traditionalFarmer: 38, agroLinkFarmer: 60, consumerRetail: 85, demand: 'Very High' },
      { name: 'Green Chili', unit: 'kg', traditionalFarmer: 50, agroLinkFarmer: 90, consumerRetail: 140, demand: 'Fluctuating' },
      { name: 'Hilsa Fish (1kg)', unit: 'piece', traditionalFarmer: 800, agroLinkFarmer: 1100, consumerRetail: 1500, demand: 'High' },
      { name: 'Farm Brown Eggs', unit: 'dozen', traditionalFarmer: 95, agroLinkFarmer: 115, consumerRetail: 140, demand: 'Stable' },
      { name: 'Organic Garlic', unit: 'kg', traditionalFarmer: 85, agroLinkFarmer: 125, consumerRetail: 180, demand: 'High' },
    ];

    res.json({
      success: true,
      lastUpdated: new Date().toLocaleDateString('en-GB'),
      prices,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Simulate AI crop disease scanner diagnosis
// @route   POST /api/smart/crop-scan
// @access  Private
const diagnoseCropDisease = async (req, res, next) => {
  try {
    const { cropType } = req.body; // e.g. potato, tomato, rice, wheat

    const database = {
      potato: {
        disease: 'Late Blight (লেট ব্লাইট)',
        pathogen: 'Phytophthora infestans',
        confidence: 94.2,
        symptoms: 'Water-soaked spots on leaves that turn brown-black with white mildew growth on the underside during humid weather.',
        organicTreatment: 'Spray copper oxychloride (3g/L) or apply Trichoderma harzianum bio-fungicide. Space plants out to improve ventilation.',
        chemicalTreatment: 'Apply Mancozeb or Ridomil Gold at recommended dosage. Avoid overhead watering.',
      },
      rice: {
        disease: 'Rice Blast (ধানের ব্লাস্ট)',
        pathogen: 'Magnaporthe oryzae',
        confidence: 89.7,
        symptoms: 'Spindle-shaped lesions with ash-colored centers and brown borders on leaves, nodes, and panicles.',
        organicTreatment: 'Avoid excessive nitrogen fertilization. Apply organic potash. Spray liquid seaweed extract to boost immunity.',
        chemicalTreatment: 'Apply Tricyclazole 75WP (0.6g/L) or Nativo 75WG immediately upon seeing lesions.',
      },
      tomato: {
        disease: 'Tomato Leaf Curl Virus (পাতা কোঁকড়ানো রোগ)',
        pathogen: 'Tomato yellow leaf curl virus (TYLCV) via Whitefly vector',
        confidence: 91.5,
        symptoms: 'Severe curling, puckering, and yellowing of young leaves. Stunted plant growth and reduced flowering.',
        organicTreatment: 'Install yellow sticky traps to catch whiteflies. Spray neem oil mix (5ml/L + detergent emulsifier).',
        chemicalTreatment: 'Control the vector (whitefly) using Imidacloprid (0.5ml/L) or Acetamiprid spray.',
      },
      generic: {
        disease: 'Healthy Leaf (সুস্থ পাতা)',
        pathogen: 'None',
        confidence: 98.4,
        symptoms: 'No visible lesions, normal coloration, healthy turgidity.',
        organicTreatment: 'Continue balanced composting, crop rotation, and regular monitoring.',
        chemicalTreatment: 'No chemical inputs required. Keep soil healthy.',
      },
    };

    const diagnosis = database[cropType.toLowerCase()] || database['generic'];

    res.json({
      success: true,
      diagnosis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product recommendation based on user viewing/role
// @route   GET /api/smart/recommendations
// @access  Public
const getSmartRecommendations = async (req, res, next) => {
  try {
    // Return high-rating products or random approved products as recommendations
    const recommendations = await Product.find({ status: 'approved' })
      .populate('category', 'name')
      .populate('farmer', 'name address')
      .limit(6)
      .sort({ rating: -1 });

    res.json({ success: true, products: recommendations });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getWeatherAdvice,
  getMarketPrices,
  diagnoseCropDisease,
  getSmartRecommendations,
};
