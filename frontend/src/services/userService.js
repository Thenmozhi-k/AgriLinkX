import api from './api.js';

// Mock data for development
const mockFollowers = [
  {
    id: '3',
    name: 'Agricultural Expert',
    avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'expert',
  },
  {
    id: '4',
    name: 'AgriTech Solutions',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'business',
  },
];

const mockFollowing = [
  {
    id: '5',
    name: 'Organic Seed Supplier',
    avatar: 'https://images.pexels.com/photos/977402/pexels-photo-977402.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'supplier',
  },
  {
    id: '6',
    name: 'Green Farming Initiative',
    avatar: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'organization',
  },
];

const mockSuggestions = [
  {
    id: '7',
    name: 'Sustainable Farming Collective',
    avatar: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'organization',
  },
  {
    id: '8',
    name: 'Farm Equipment Supplier',
    avatar: 'https://images.pexels.com/photos/1121796/pexels-photo-1121796.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'business',
  },
  {
    id: '9',
    name: 'Agricultural University',
    avatar: 'https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=150',
    role: 'education',
  },
];

// Service methods
const getFollowers = async (userId) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockFollowers;
};

const getFollowing = async (userId) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockFollowing;
};

const getSuggestions = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockSuggestions;
};

const followUser = async (userId) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  const followedUser = mockSuggestions.find((user) => user.id === userId);
  return followedUser || { id: userId, name: 'Unknown User', role: 'user' };
};

const unfollowUser = async (userId) => {
  const response = await api.delete(`/unfollow/${userId}`);
  return response.data;
};

// Export service
const userService = {
  getFollowers,
  getFollowing,
  getSuggestions,
  followUser,
  unfollowUser,
};

export default userService;
