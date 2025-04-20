import api from './api.js';

const notificationService = {
  getNotifications: async () => {
    try {
      const response = await api.get('/notifications');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error.response?.data || error.message);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await api.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error.response?.data || error.message);
      throw error;
    }
  },

  markAllAsRead: async () => {
    try {
      const response = await api.put('/notifications/read-all');
      return response.data;
    } catch (error) {
      console.error('Error marking all notifications as read:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getUnreadCount: async () => {
    try {
      const response = await api.get('/notifications/unread-count');
      return response.data.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default notificationService;