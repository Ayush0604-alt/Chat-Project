const Message = require('../Model/message');
const Conversation = require('../Model/conversation');

// Send a message
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text, attachmentsMeta } = req.body;
    const senderId = req.user.id;

    // Check conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });

    // Create message
    const message = new Message({
      conversationId,
      senderId,
      text,
      attachmentsMeta,
      readBy: [senderId] // sender has read it
    });
    await message.save();

    // Update lastMessage & updatedAt in conversation
    conversation.lastMessage = text || 'Attachment';
    conversation.updatedAt = new Date();
    await conversation.save();

    res.status(201).json({ success: true, message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get messages for a conversation (paginated)
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: -1 }) // latest first
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('senderId', 'username avatarUrl');

    res.json({ success: true, messages });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Mark messages as read by current user
exports.markAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user.id;

    await Message.updateMany(
      { conversationId, readBy: { $ne: userId } },
      { $push: { readBy: userId } }
    );

    res.json({ success: true, message: 'Messages marked as read' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
