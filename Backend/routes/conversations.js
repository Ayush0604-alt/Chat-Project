const express = require('express');
const {
  createConversation,
  getUserConversations,
  getConversationById,
  addUserToGroup
} = require('../controller/conversationController');
const authMiddleware = require('../Middleware/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createConversation);

router.get('/', authMiddleware, getUserConversations);

router.get('/:id', authMiddleware, getConversationById);

router.post('/:id/add-user', authMiddleware, addUserToGroup);

module.exports = router;
