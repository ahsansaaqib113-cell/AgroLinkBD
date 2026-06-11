const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getFarmerOrders,
  getOrderById,
  updateOrderPaymentStatus,
  updateOrderShippingStatus,
  validateCoupon,
  getCoupons,
  createCoupon,
} = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleGuard');

// Protected routes (General buyer/farmer)
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);
router.get('/farmer', protect, authorize('farmer'), getFarmerOrders);
router.get('/:id', protect, getOrderById);

// Payment & shipping status
router.put('/:id/pay', protect, updateOrderPaymentStatus);
router.put('/:id/shipping', protect, authorize('farmer', 'admin'), updateOrderShippingStatus);

// Coupons
router.post('/coupons/validate', protect, validateCoupon);
router.get('/coupons', protect, authorize('admin'), getCoupons);
router.post('/coupons', protect, authorize('admin'), createCoupon);

module.exports = router;
