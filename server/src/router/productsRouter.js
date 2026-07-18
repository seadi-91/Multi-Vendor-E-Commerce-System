const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');

// Public endpoints - no authentication required
router.get('/categories-with-products', productController.getCategoriesWithProducts);
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);

// New endpoints for optimized fetching
router.get('/cached/all', productController.getCachedProducts);
router.get('/cached/:id', productController.getCachedProductById);
router.get('/live/price-stock', productController.getLiveProductsPriceAndStock);
router.get('/live/:id/price-stock', productController.getLiveProductPriceAndStock);

router.get('/category-id/:categoryId', productController.getProductsByCategoryId);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/:id', productController.getProductById);

module.exports = router;
