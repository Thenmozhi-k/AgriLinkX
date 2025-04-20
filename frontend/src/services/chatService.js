import api from './api.js';

const chatService = {
  getChatRooms: async () => {
    try {
      const response = await api.get('/chat/rooms');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching chat rooms:', error.response?.data || error.message);
      throw error;
    }
  },

  getMessages: async (roomId) => {
    try {
      const response = await api.get(`/chat/room/${roomId}/messages`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching messages:', error.response?.data || error.message);
      throw error;
    }
  },

  sendMessage: async (roomId, content) => {
    try {
      const response = await api.post(`/chat/room/${roomId}/message`, { content });
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error.message);
      throw error;
    }
  },

  createChatRoom: async (name, participants) => {
    try {
      const response = await api.post('/chat/room/create', { name, participants });
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getDirectChat: async (userId) => {
    try {
      const response = await api.get(`/chat/direct/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error getting direct chat:', error.response?.data || error.message);
      throw error;
    }
  },
  
  markRoomAsRead: async (roomId) => {
    try {
      const response = await api.put(`/chat/room/${roomId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking room as read:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default chatService;