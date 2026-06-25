const express = require('express');
const router = express.Router();
const adminController = require('../controller/adminController');
const { protect, adminOnly } = require('../middleware/auth');

// Dashboard statistics
router.get('/stats', protect, adminOnly, adminController.getDashboardStats);

// User Management
router.get('/users', protect, adminOnly, adminController.getAllUsers);
router.get('/users/active', protect, adminOnly, adminController.getActiveUsers);
router.get('/users/suspended', protect, adminOnly, adminController.getSuspendedUsers);
router.put('/users/:id/suspend', protect, adminOnly, adminController.suspendUser);
router.put('/users/:id/activate', protect, adminOnly, adminController.activateUser);
router.delete('/users/:id', protect, adminOnly, adminController.deleteUser);

// Farmer Management
router.get('/farmers', protect, adminOnly, adminController.getAllFarmers);
router.get('/farmers/pending', protect, adminOnly, adminController.getPendingFarmers);
router.get('/farmers/verified', protect, adminOnly, adminController.getVerifiedFarmers);
router.put('/farmers/:id/verify', protect, adminOnly, adminController.verifyFarmer);
router.put('/farmers/:id/reject', protect, adminOnly, adminController.rejectFarmer);

// Product Management
router.get('/products', protect, adminOnly, adminController.getAllProducts);
router.get('/products/pending', protect, adminOnly, adminController.getPendingProducts);
router.put('/products/:id/approve', protect, adminOnly, adminController.approveProduct);
router.put('/products/:id/reject', protect, adminOnly, adminController.rejectProduct);
router.delete('/products/:id', protect, adminOnly, adminController.deleteProduct);

// Analytics & Reports
router.get('/reports', protect, adminOnly, adminController.getReports);
router.get('/transactions', protect, adminOnly, adminController.getTransactions);

// Admin Profile
router.get('/profile', protect, adminOnly, adminController.getAdminProfile);
router.put('/profile', protect, adminOnly, adminController.updateAdminProfile);

module.exports = router;
