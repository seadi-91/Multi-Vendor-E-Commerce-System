const express = require('express');
const router = express.Router();
const messageController = require('../controller/messageController');
const { protect } = require('../middleware/auth');

// Get conversation with another user
router.get('/', protect, messageController.getMessages);

// Send a new message
router.post('/', protect, messageController.sendMessage);

// Update a message content
router.patch('/:messageId', protect, messageController.updateMessage);

// Mark a specific message as read
router.patch('/:messageId/read', protect, messageController.markAsRead);

module.exports = router;
