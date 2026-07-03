const express = require('express');
const router = express.Router();
const productController = require('../controller/productController');

// Public endpoints - no authentication required
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);
router.get('/category/:category', productController.getProductsByCategory);

module.exports = router;
