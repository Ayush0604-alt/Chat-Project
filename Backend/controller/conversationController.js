const Conversation = require('../Model/conversation'); 
const User = require('../Model/user'); 

// Create a new conversation (private or group)
exports.createConversation = async (req, res) => {
  try {
    const { participants, type, members } = req.body;

    // Validate participants exist
    const usersExist = await User.find({ _id: { $in: participants } });
    if (usersExist.length !== participants.length) {
      return res.status(400).json({ success: false, message: 'Some users do not exist' });
    }

    // For groups, validate members
    if (type === 'group' && members) {
      const membersExist = await User.find({ _id: { $in: members } });
      if (membersExist.length !== members.length) {
        return res.status(400).json({ success: false, message: 'Some group members do not exist' });
      }
    }

    const conversation = new Conversation({
      participants,
      type: type || 'private',
      members: type === 'group' ? members : participants
    });

    await conversation.save();
    res.status(201).json({ success: true, conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get all conversations for the logged-in user
exports.getUserConversations = async (req, res) => {
  try {
    const userId = req.user.id;

    const conversations = await Conversation.find({ participants: userId })
      .populate('participants', 'username avatarUrl')
      .sort({ updatedAt: -1 });

    res.json({ success: true, conversations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get specific conversation by ID
exports.getConversationById = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.id)
      .populate('participants', 'username avatarUrl')
      .populate('members', 'username avatarUrl'); // for groups

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    res.json({ success: true, conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add a user to a group
exports.addUserToGroup = async (req, res) => {
  try {
    const { userId } = req.body;
    const conversation = await Conversation.findById(req.params.id);

    if (!conversation) return res.status(404).json({ success: false, message: 'Conversation not found' });
    if (conversation.type !== 'group') return res.status(400).json({ success: false, message: 'Not a group conversation' });

    if (!conversation.members.includes(userId)) conversation.members.push(userId);
    if (!conversation.participants.includes(userId)) conversation.participants.push(userId);

    await conversation.save();
    res.json({ success: true, conversation });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
