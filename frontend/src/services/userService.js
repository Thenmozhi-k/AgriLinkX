import api from './api.js';

const userService = {
  getFollowers: async (userId) => {
    try {
      const response = await api.get(`/followers/${userId}`);
      return response.data.followers || [];
    } catch (error) {
      console.error('Error fetching followers:', error.response?.data || error.message);
      throw error;
    }
  },

  getFollowing: async (userId) => {
    try {
      const response = await api.get(`/following/${userId}`);
      return response.data.following || [];
    } catch (error) {
      console.error('Error fetching following:', error.response?.data || error.message);
      throw error;
    }
  },

  getSuggestions: async () => {
    try {
      const response = await api.get('/suggestions');
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error.response?.data || error.message);
      throw error;
    }
  },

  followUser: async (userId) => {
    try {
      const response = await api.post(`/follow/${userId}`);
      return response.data.followedUser;
    } catch (error) {
      console.error('Error following user:', error.response?.data || error.message);
      throw error;
    }
  },

  unfollowUser: async (userId) => {
    try {
      const response = await api.delete(`/unfollow/${userId}`);
      return response.data.unfollowedUser;
    } catch (error) {
      console.error('Error unfollowing user:', error.response?.data || error.message);
      throw error;
    }
  },
  
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/users/search?q=${query}`);
      return response.data.users || [];
    } catch (error) {
      console.error('Error searching users:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getUserProfile: async (userId) => {
    try {
      const response = await api.get(`/auth/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default userService;