const express = require('express');
const { sendMessage, getMessages, markAsRead } = require('../controller/message-controller');
const authMiddleware = require('../Middleware/authMiddleware');

const router = express.Router();

// Send a new message
router.post('/', authMiddleware, sendMessage);

// Get messages for a conversation (paginated)
router.get('/:conversationId', authMiddleware, getMessages);

// Mark messages as read
router.post('/:conversationId/read', authMiddleware, markAsRead);

module.exports = router;
