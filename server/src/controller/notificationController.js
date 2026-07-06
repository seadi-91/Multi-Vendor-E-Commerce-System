const prisma = require('../prisma/client');

// Get notifications for the logged-in user
exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Mark a notification as read
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const updated = await prisma.notification.update({
      where: { id: Number(notificationId) },
      data: { read: true }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
