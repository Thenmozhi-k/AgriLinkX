import api from './api.js';

const userService = {
  getFollowers: async (userId) => {
    try {
      console.log(`Fetching followers for user: ${userId}`);
      const response = await api.get(`/connections/followers/${userId}`);
      console.log('Followers response:', response.data);
      return response.data.followers || [];
    } catch (error) {
      console.error('Error fetching followers:', error.response?.data || error.message);
      throw error;
    }
  },

  getFollowing: async (userId) => {
    try {
      console.log(`Fetching following for user: ${userId}`);
      const response = await api.get(`/connections/following/${userId}`);
      console.log('Following response:', response.data);
      return response.data.following || [];
    } catch (error) {
      console.error('Error fetching following:', error.response?.data || error.message);
      throw error;
    }
  },

  getMutualConnections: async (userId) => {
    try {
      console.log(`Fetching mutual connections with user: ${userId}`);
      const response = await api.get(`/connections/mutual/${userId}`);
      console.log('Mutual connections response:', response.data);
      return response.data.mutualConnections || [];
    } catch (error) {
      console.error('Error fetching mutual connections:', error.response?.data || error.message);
      throw error;
    }
  },

  getSuggestions: async () => {
    try {
      const response = await api.get('/connections/suggestions');
      console.log('Suggestions response:', response.data);
      return response.data.suggestions || [];
    } catch (error) {
      console.error('Error fetching suggestions:', error.response?.data || error.message);
      throw error;
    }
  },

  followUser: async (userId) => {
    try {
      console.log(`Sending follow request to user: ${userId}`);
      const response = await api.post(`/connections/follow/${userId}`);
      return response.data.followedUser;
    } catch (error) {
      console.error('Error following user:', error.response?.data || error.message);
      throw error;
    }
  },

  unfollowUser: async (userId) => {
    try {
      console.log(`Unfollowing user: ${userId}`);
      const response = await api.delete(`/connections/unfollow/${userId}`);
      return response.data.unfollowedUser;
    } catch (error) {
      console.error('Error unfollowing user:', error.response?.data || error.message);
      throw error;
    }
  },
  
  checkFollowingStatus: async (userId) => {
    try {
      console.log(`Checking follow status for user: ${userId}`);
      const response = await api.get(`/connections/check-following/${userId}`);
      console.log('Follow status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error checking follow status:', error.response?.data || error.message);
      throw error;
    }
  },
  
  getFollowRequests: async () => {
    try {
      console.log('Fetching follow requests');
      const response = await api.get('/connections/follow-requests');
      console.log('Follow requests response:', response.data);
      return response.data.followRequests || [];
    } catch (error) {
      console.error('Error fetching follow requests:', error.response?.data || error.message);
      throw error;
    }
  },
  
  acceptFollowRequest: async (userId) => {
    try {
      console.log(`Accepting follow request from user: ${userId}`);
      const response = await api.post(`/connections/accept-follow/${userId}`);
      return response.data.follower;
    } catch (error) {
      console.error('Error accepting follow request:', error.response?.data || error.message);
      throw error;
    }
  },
  
  rejectFollowRequest: async (userId) => {
    try {
      console.log(`Rejecting follow request from user: ${userId}`);
      const response = await api.delete(`/connections/reject-follow/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error rejecting follow request:', error.response?.data || error.message);
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
      const response = await api.get(`/users/${userId}`);
      return response.data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default userService;