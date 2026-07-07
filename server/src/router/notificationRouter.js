const express = require('express');
const router = express.Router();
const notificationController = require('../controller/notificationController');
const { protect } = require('../middleware/auth');

// All notification routes require authentication
router.use(protect);

// IMPORTANT: Specific routes must come before parameterized routes
// Get unread notification count
router.get('/unread-count', notificationController.getUnreadCount);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllAsRead);

// Clear all notifications
router.delete('/clear-all', notificationController.clearAllNotifications);

// Get all notifications for current user
router.get('/', notificationController.getNotifications);

// Mark a specific notification as read
router.put('/:notificationId/read', notificationController.markAsRead);

// Delete a specific notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;
