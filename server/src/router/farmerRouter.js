const express = require('express');
const router = express.Router();
const farmerController = require('../controller/farmerController');
const { protect, farmerOnly } = require('../middleware/auth');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Apply protect middleware to all routes
router.use(protect);

// Apply farmerOnly middleware to all routes
router.use(farmerOnly);

// Dashboard Statistics
router.get('/stats', farmerController.getDashboardStats);

// Alerts
router.get('/alerts', farmerController.getAlerts);

// Product Management
router.get('/products', farmerController.getFarmerProducts);
router.post('/products', upload.single('image'), farmerController.createProduct);
router.put('/products/:id', upload.single('image'), farmerController.updateProduct);
router.delete('/products/:id', farmerController.deleteProduct);

// Order Management
router.get('/orders', farmerController.getFarmerOrders);
router.get('/orders/pending', farmerController.getPendingOrders);
router.get('/orders/completed', farmerController.getCompletedOrders);
router.put('/orders/:id/complete', farmerController.completeOrder);

// Earnings
router.get('/earnings', farmerController.getEarnings);
router.get('/earnings/reports', farmerController.getEarningsReports);
router.post('/earnings/withdraw', farmerController.requestWithdrawal);

// Analytics
router.get('/analytics/sales', farmerController.getSalesAnalytics);
router.get('/analytics/traffic', farmerController.getTrafficAnalytics);
router.get('/analytics/performance', farmerController.getPerformanceAnalytics);

// Farmer Profile
router.get('/profile', farmerController.getFarmerProfile);
router.put('/profile', farmerController.updateFarmerProfile);

// Farmer Settings
router.get('/settings', farmerController.getFarmerSettings);
router.put('/settings', farmerController.updateFarmerSettings);
router.put('/settings/password', farmerController.changePassword);

module.exports = router;
