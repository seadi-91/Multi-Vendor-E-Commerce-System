const prisma = require('../prisma/client');

// Get messages between two users (farmer and another user)
exports.getMessages = async (req, res) => {
  try {
    const { withUserId } = req.query; // id of the other participant
    const userId = req.user.id;
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: Number(withUserId) },
          { senderId: Number(withUserId), receiverId: userId }
        ]
      },
      orderBy: { createdAt: 'asc' }
    });
    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Send a new message
exports.sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;
    const message = await prisma.message.create({
      data: { senderId, receiverId, content }
    });
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// Mark a message as read
exports.markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const updated = await prisma.message.update({
      where: { id: Number(messageId) },
      data: { read: true }
    });
    res.json(updated);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
