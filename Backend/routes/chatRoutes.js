const express = require('express');
const { getChatRooms, getMessages, sendMessage, createChatRoom, getDirectChat, markRoomAsRead } = require('../controllers/chatController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all chat rooms for the current user
router.get('/rooms', getChatRooms);

// Get messages for a specific chat room
router.get('/room/:roomId/messages', getMessages);

// Send a message to a chat room
router.post('/room/:roomId/message', sendMessage);

// Create a new chat room
router.post('/room/create', createChatRoom);

// Get or create a direct chat with another user
router.get('/direct/:userId', getDirectChat);

// Mark a chat room as read for the current user
router.put('/room/:roomId/read', markRoomAsRead);

module.exports = router;