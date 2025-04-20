const express = require('express');
const { getNotifications, markAsRead, markAllAsRead, getUnreadCount } = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Get all notifications for the current user
router.get('/', getNotifications);

// Mark a notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/read-all', markAllAsRead);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

module.exports = router;