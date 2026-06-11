const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  moderateProduct,
  getCategories,
  createCategory,
} = require('../controllers/productController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleGuard');

// Public routes
router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:id', getProductById);

// Protected routes (Farmer/Admin product CRUD)
router.post('/', protect, authorize('farmer'), createProduct);
router.put('/:id', protect, authorize('farmer', 'admin'), updateProduct);
router.delete('/:id', protect, authorize('farmer', 'admin'), deleteProduct);

// Admin only routes
router.put('/:id/moderate', protect, authorize('admin'), moderateProduct);
router.post('/categories', protect, authorize('admin'), createCategory);

module.exports = router;
