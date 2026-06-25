const express = require('express');
const router = express.Router();
const farmerController = require('../controller/farmerController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Dashboard Statistics
router.get('/stats', protect, farmerController.getDashboardStats);

// Product Management
router.get('/products', protect, farmerController.getFarmerProducts);
router.post('/products', protect, upload.single('image'), farmerController.createProduct);
router.put('/products/:id', protect, upload.single('image'), farmerController.updateProduct);
router.delete('/products/:id', protect, farmerController.deleteProduct);

// Order Management
router.get('/orders', protect, farmerController.getFarmerOrders);
router.get('/orders/pending', protect, farmerController.getPendingOrders);
router.get('/orders/completed', protect, farmerController.getCompletedOrders);
router.put('/orders/:id/complete', protect, farmerController.completeOrder);

// Earnings
router.get('/earnings', protect, farmerController.getEarnings);
router.get('/earnings/reports', protect, farmerController.getEarningsReports);
router.post('/earnings/withdraw', protect, farmerController.requestWithdrawal);

// Analytics
router.get('/analytics/sales', protect, farmerController.getSalesAnalytics);
router.get('/analytics/traffic', protect, farmerController.getTrafficAnalytics);
router.get('/analytics/performance', protect, farmerController.getPerformanceAnalytics);

// Farmer Profile
router.get('/profile', protect, farmerController.getFarmerProfile);
router.put('/profile', protect, farmerController.updateFarmerProfile);

// Farmer Settings
router.get('/settings', protect, farmerController.getFarmerSettings);
router.put('/settings', protect, farmerController.updateFarmerSettings);
router.put('/settings/password', protect, farmerController.changePassword);

module.exports = router;
