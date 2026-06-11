const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Farmer = require('../models/Farmer');
const BulkRequest = require('../models/BulkRequest');

// @desc    Get sales and order statistics for a Farmer
// @route   GET /api/analytics/farmer
// @access  Private (Farmer only)
const getFarmerAnalytics = async (req, res, next) => {
  try {
    const farmerId = req.user._id;

    // Aggregated earnings
    const farmerProfile = await Farmer.findOne({ user: farmerId });
    const totalEarnings = farmerProfile ? farmerProfile.earnings : 0;

    // Order counts
    const totalOrders = await Order.countDocuments({ farmer: farmerId });
    const pendingOrders = await Order.countDocuments({ farmer: farmerId, shippingStatus: 'pending' });
    const shippedOrders = await Order.countDocuments({ farmer: farmerId, shippingStatus: 'shipped' });
    const completedOrders = await Order.countDocuments({ farmer: farmerId, shippingStatus: 'delivered' });

    // Monthly sales breakdown (mock data for charting if empty)
    const salesChart = [
      { month: 'Jan', sales: totalEarnings * 0.1 || 12000 },
      { month: 'Feb', sales: totalEarnings * 0.15 || 18000 },
      { month: 'Mar', sales: totalEarnings * 0.2 || 24000 },
      { month: 'Apr', sales: totalEarnings * 0.25 || 30000 },
      { month: 'May', sales: totalEarnings * 0.3 || 38000 },
    ];

    // Popular crops (aggregating product quantities)
    const products = await Product.find({ farmer: farmerId }).sort({ rating: -1 }).limit(3);
    const popularProducts = products.map(p => ({
      name: p.name,
      rating: p.rating,
      stock: p.stock,
      price: p.price,
    }));

    res.json({
      success: true,
      analytics: {
        totalEarnings,
        totalOrders,
        pendingOrders,
        shippedOrders,
        completedOrders,
        salesChart,
        popularProducts,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get global marketplace statistics for Admin
// @route   GET /api/analytics/admin
// @access  Private (Admin only)
const getAdminAnalytics = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments({});
    const customersCount = await User.countDocuments({ role: 'customer' });
    const farmersCount = await User.countDocuments({ role: 'farmer' });
    const businessCount = await User.countDocuments({ role: 'business' });

    const totalProducts = await Product.countDocuments({});
    const pendingProducts = await Product.countDocuments({ status: 'pending' });
    const approvedProducts = await Product.countDocuments({ status: 'approved' });

    // Platform revenue calculation
    const paidOrders = await Order.find({ paymentStatus: 'paid' });
    const totalSales = paidOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);
    const platformCommission = parseFloat((totalSales * 0.05).toFixed(2)); // Platform takes a simulated 5% commission

    // Monthly platform sales chart
    const adminSalesChart = [
      { month: 'Jan', revenue: 45000, commission: 2250 },
      { month: 'Feb', revenue: 62000, commission: 3100 },
      { month: 'Mar', revenue: 85000, commission: 4250 },
      { month: 'Apr', revenue: 110000, commission: 5500 },
      { month: 'May', revenue: 150000, commission: 7500 },
    ];

    res.json({
      success: true,
      analytics: {
        totalUsers,
        usersBreakdown: { customers: customersCount, farmers: farmersCount, business: businessCount },
        totalProducts,
        productsBreakdown: { pending: pendingProducts, approved: approvedProducts },
        totalSales,
        platformCommission,
        adminSalesChart,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get regional demand insights and bulk statistics for Business Buyer
// @route   GET /api/analytics/business
// @access  Private (Business only)
const getBusinessAnalytics = async (req, res, next) => {
  try {
    const buyerId = req.user._id;

    const myBulkRequestsCount = await BulkRequest.countDocuments({ buyer: buyerId });
    const activeBulkRequestsCount = await BulkRequest.countDocuments({ buyer: buyerId, status: 'open' });

    // Regional Demand Insights (mock stats for Bangladesh market planning)
    const regionalDemand = [
      { crop: 'Miniket Rice', region: 'Dinajpur/Naogaon', demandIndex: 'High', avgPrice: 1650 },
      { crop: 'Deshi Potato', region: 'Munshiganj', demandIndex: 'Stable', avgPrice: 22 },
      { crop: 'Mango', region: 'Rajshahi/Chapainawabganj', demandIndex: 'Extremely High', avgPrice: 80 },
      { crop: 'Hilsa Fish', region: 'Chandpur/Bhola', demandIndex: 'High', avgPrice: 1100 },
      { crop: 'Organic Tea', region: 'Sylhet/Sreemangal', demandIndex: 'Stable', avgPrice: 350 },
    ];

    res.json({
      success: true,
      analytics: {
        myBulkRequestsCount,
        activeBulkRequestsCount,
        regionalDemand,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getFarmerAnalytics,
  getAdminAnalytics,
  getBusinessAnalytics,
};
