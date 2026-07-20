const prisma = require('../db/prismaClient');

// Get messages between two users (farmer and another user)
exports.getMessages = async (req, res) => {
  try {
    const { withUserId } = req.query; // id of the other participant
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log(`[messages] getMessages requested by user ${userId} with withUserId=${withUserId}`);
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
    const senderId = req.user?.id;
    
    if (!senderId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log(`[messages] sendMessage from user ${senderId} to ${receiverId} content: ${content}`);
    const parsedReceiverId = Number(receiverId);
    // Server-side validation: disallow URLs, phone numbers, and @usernames
    const text = typeof content === 'string' ? content : (content?.text || JSON.stringify(content));
    const hasUrl = /https?:\/\/\S+|www\.\S+/i.test(text);
    const hasAtUser = /@\w+/i.test(text);
    const hasPhoneLike = /(?:\+?\d[\d\-\s()]{5,}\d)/.test(text);

    if (hasUrl || hasAtUser || hasPhoneLike) {
      console.warn('[messages] Prohibited content blocked from user', senderId);
      return res.status(400).json({ error: 'Prohibited content: links, phone numbers, and usernames are not allowed' });
    }

    const message = await prisma.message.create({
      data: { senderId: Number(senderId), receiverId: parsedReceiverId, content }
    });
    res.json(message);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const existing = await prisma.message.findUnique({ where: { id: Number(messageId) } });
    if (!existing) {
      return res.status(404).json({ error: 'Message not found' });
    }
    if (existing.senderId !== Number(userId)) {
      return res.status(403).json({ error: 'You can only edit your own messages' });
    }

    const text = typeof content === 'string' ? content : (content?.text || JSON.stringify(content));
    const hasUrl = /https?:\/\/\S+|www\.\S+/i.test(text);
    const hasAtUser = /@\w+/i.test(text);
    const hasPhoneLike = /(?:\+?\d[\d\-\s()]{5,}\d)/.test(text);

    if (hasUrl || hasAtUser || hasPhoneLike) {
      return res.status(400).json({ error: 'Prohibited content: links, phone numbers, and usernames are not allowed' });
    }

    const updated = await prisma.message.update({
      where: { id: Number(messageId) },
      data: { content }
    });
    res.json(updated);
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
