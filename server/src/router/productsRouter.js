const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');

// Public endpoints - no authentication required
router.get('/categories-with-products', productController.getCategoriesWithProducts);
router.get('/', productController.getProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/category-id/:categoryId', productController.getProductsByCategoryId);

module.exports = router;
