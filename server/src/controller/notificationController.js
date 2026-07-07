const { prisma } = require('../db/connectDB');

// Get notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    console.log('=== getNotifications called ===');
    console.log('req.user:', JSON.stringify(req.user, null, 2));
    
    if (!req.user || !req.user.id) {
      console.error('User or user.id is missing from request');
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    const userId = req.user.id;
    console.log('Fetching notifications for userId:', userId);
    
    // **CRITICAL: Verify user exists (prevents 500 errors after deletion)**
    console.log('Verifying user existence...');
    const user = await prisma.user.findUnique({ 
      where: { id: userId },
      select: { id: true, isActive: true }
    });
    
    if (!user) {
      console.error('User not found - likely deleted');
      return res.status(404).json({ 
        error: 'User account not found. Your account may have been removed.',
        code: 'USER_NOT_FOUND'
      });
    }
    
    console.log('User found:', user.id, 'Active:', user.isActive);
    
    // Now try to get notifications
    console.log('Querying notifications...');
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('Found notifications:', notifications.length);
    res.json(notifications);
  } catch (error) {
    console.error('=== ERROR in getNotifications ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        error: 'User account not found',
        code: 'USER_NOT_FOUND'
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch notifications. Please try again later.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined 
    });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { 
        id: Number(notificationId),
        userId 
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    const updated = await prisma.notification.update({
      where: { id: Number(notificationId) },
      data: { read: true }
    });
    
    res.json(updated);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.notification.updateMany({
      where: { 
        userId,
        read: false 
      },
      data: { read: true }
    });
    
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete a notification
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Verify notification belongs to user
    const notification = await prisma.notification.findFirst({
      where: { 
        id: Number(notificationId),
        userId 
      }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    await prisma.notification.delete({
      where: { id: Number(notificationId) }
    });
    
    res.json({ message: 'Notification deleted successfully' });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ error: error.message });
  }
};

// Clear all notifications
exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    
    await prisma.notification.deleteMany({
      where: { userId }
    });
    
    res.json({ message: 'All notifications cleared successfully' });
  } catch (error) {
    console.error('Error clearing notifications:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get unread count
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const count = await prisma.notification.count({
      where: { 
        userId,
        read: false 
      }
    });
    
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create a notification (helper function for internal use)
exports.createNotification = async (userId, type, title, message, productId = null) => {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        title,
        message,
        productId,
        read: false
      }
    });
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    throw error;
  }
};

// Bulk create notifications for multiple recipients (e.g., all admins)
exports.createBulkNotifications = async (recipientIds, type, title, message, productId = null) => {
  try {
    const notifications = await prisma.notification.createMany({
      data: recipientIds.map(userId => ({
        userId,
        type,
        title,
        message,
        productId,
        read: false
      }))
    });
    return notifications;
  } catch (error) {
    console.error('Error creating bulk notifications:', error);
    throw error;
  }
};
