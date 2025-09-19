const express = require('express');
const { getUserById, getCurrentUser, updateAvatar, searchUsers } = require('../controller/user-controller');
const authMiddleware = require('../Middleware/authMiddleware');

const router = express.Router();

router.get('/me', authMiddleware, getCurrentUser);


router.put('/me/avatar', authMiddleware, updateAvatar);

router.get('/', authMiddleware, searchUsers);


router.get('/:id', authMiddleware, getUserById);

module.exports = router;
