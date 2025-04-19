import api from './api.js';

// Mock APIs are temporary until backend is integrated
const authService = {
  login: async (credentials) => {
    // For demo purposes, using a slight delay to simulate network request
    // In a real app, this would call the actual API endpoint
    // const response = await api.post('/auth/login', credentials);
    // return response.data;

    // Mock response
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (credentials.email === 'demo@agrilinkx.com' && credentials.password === 'password') {
      return {
        user: {
          id: '1',
          name: 'Demo Farmer',
          email: 'demo@agrilinkx.com',
          role: 'farmer',
          bio: 'Passionate organic farmer with 10 years of experience',
        },
        token: 'mock-jwt-token',
      };
    }

    throw new Error('Invalid credentials');
  },

  signup: async (userData) => {
    // For demo purposes, using a slight delay to simulate network request
    // const response = await api.post('/auth/signup', userData);
    // return response.data;

    // Mock response
    await new Promise((resolve) => setTimeout(resolve, 800));

    return {
      user: {
        id: '2',
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
      token: 'mock-jwt-token',
    };
  },

  logout: async () => {
    // In a real app, we might need to invalidate the token on the server
    // await api.post('/auth/logout');

    // For the demo, we just return
    return true;
  },

  getUser: async (userId) => {
    const response = await api.get(`/auth/user/${userId}`);
    return response.data;
  },

  updateUser: async (userId, userData) => {
    const response = await api.put(`/auth/user/update/${userId}`, userData);
    return response.data;
  },
};

export default authService;
