import api from './api.js';

const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/auth/login', credentials);
      
      // Store token in localStorage for persistence
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      throw error;
    }
  },

  signup: async (userData) => {
    try {
      const response = await api.post('/auth/signup', userData);
      
      // Store token in localStorage for persistence
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      return response.data;
    } catch (error) {
      console.error('Signup error:', error.response?.data || error.message);
      throw error;
    }
  },

  logout: async () => {
    // Remove token and user from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  },

  getUser: async (userId) => {
    try {
      const response = await api.get(`/auth/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Get user error:', error.response?.data || error.message);
      throw error;
    }
  },

  updateUser: async (userId, userData) => {
    try {
      const response = await api.put(`/auth/user/update/${userId}`, userData);
      
      // Update user in localStorage if it's the current user
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      if (currentUser._id === userId) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
      
      return response.data;
    } catch (error) {
      console.error('Update user error:', error.response?.data || error.message);
      throw error;
    }
  },
  
  // Method to initialize auth state from localStorage
  initializeAuth: () => {
    const token = localStorage.getItem('token');
    let user = null;
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        user = JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Error parsing user from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem('user');
    }
    
    if (token && user) {
      return { token, user, isAuthenticated: true };
    }
    
    return { token: null, user: null, isAuthenticated: false };
  }
};

export default authService;