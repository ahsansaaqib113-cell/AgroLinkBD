const express = require('express');
const router = express.Router();
const {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getFarmerProfile,
  updateFarmerProfile,
  getAllUsers,
  toggleUserStatus,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleGuard');

// Public routes
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/farmer/:userId', getFarmerProfile);

// Protected routes (any logged-in user)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);

// Farmer only routes
router.put('/farmer', protect, authorize('farmer'), updateFarmerProfile);

// Admin only routes
router.get('/users', protect, authorize('admin'), getAllUsers);
router.put('/users/:id/status', protect, authorize('admin'), toggleUserStatus);

module.exports = router;
