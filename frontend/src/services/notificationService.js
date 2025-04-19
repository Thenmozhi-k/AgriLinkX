import api from './api.js';

// Mock data for development
const mockNotifications = [
  {
    id: '1',
    type: 'like',
    message: 'Agricultural Expert liked your post about organic tomatoes',
    isRead: false,
    createdAt: '2023-05-10T11:30:00Z',
    actionUrl: '/post/1',
  },
  {
    id: '2',
    type: 'comment',
    message: 'AgriTech Solutions commented on your post: "Great harvest! What variety are you growing?"',
    isRead: false,
    createdAt: '2023-05-10T10:45:00Z',
    actionUrl: '/post/1',
  },
  {
    id: '3',
    type: 'follow',
    message: 'Organic Seed Supplier started following you',
    isRead: true,
    createdAt: '2023-05-09T16:20:00Z',
    actionUrl: '/profile/5',
  },
  {
    id: '4',
    type: 'system',
    message: 'Weather alert: Heavy rain expected in your region in the next 48 hours',
    isRead: true,
    createdAt: '2023-05-08T09:10:00Z',
  },
];

// Service methods
const getNotifications = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockNotifications;
};

const markAsRead = async (notificationId) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return notificationId;
};

const markAllAsRead = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return true;
};

// Export service
const notificationService = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

export default notificationService;
