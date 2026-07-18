const express = require('express');
const router = express.Router();
const orderController = require('../controller/orderController');
const { protect, adminOnly } = require('../middleware/auth');

// Protected routes - require authentication
router.use(protect);

// Order management routes
router.post('/', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/:id', orderController.getOrderById);

// Order status management
router.patch('/:id/status', orderController.updateOrderStatus);

// Order cancellation
router.post('/:id/cancel', orderController.cancelOrder);

// Order refund
router.post('/:id/refund', orderController.refundOrder);

// Inventory management routes (Admin/Farmer only)
router.get('/logs/inventory', adminOnly, orderController.getInventoryLogs);
router.post('/products/:productId/adjust-stock', adminOnly, orderController.adjustStock);

module.exports = router;