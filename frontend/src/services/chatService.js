import api from './api.js';

// Mock data for development
const mockChatRooms = [
  {
    id: 'room1',
    name: 'Organic Farmers Group',
    lastMessage: 'Has anyone tried the new organic fertilizer?',
    lastMessageTime: '2023-05-10T14:30:00Z',
    unreadCount: 3,
  },
  {
    id: 'room2',
    name: 'Agricultural Experts',
    lastMessage: 'The forecast shows rain next week. Plan your harvesting accordingly.',
    lastMessageTime: '2023-05-09T10:15:00Z',
    unreadCount: 0,
  },
  {
    id: 'room3',
    name: 'Local Farmers Market',
    lastMessage: 'Market day is moved to Saturday this week due to the festival.',
    lastMessageTime: '2023-05-08T16:45:00Z',
    unreadCount: 1,
  },
];

const mockMessages = {
  room1: [
    {
      id: 'msg1',
      senderId: '3',
      senderName: 'Agricultural Expert',
      senderAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Has anyone tried the new organic fertilizer from EcoGrow?',
      createdAt: '2023-05-10T14:30:00Z',
    },
    {
      id: 'msg2',
      senderId: '5',
      senderName: 'Organic Seed Supplier',
      senderAvatar: 'https://images.pexels.com/photos/977402/pexels-photo-977402.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Yes, we\'ve been using it for a month now. The results are impressive!',
      createdAt: '2023-05-10T14:32:00Z',
    },
    {
      id: 'msg3',
      senderId: '1',
      senderName: 'Demo Farmer',
      senderAvatar: 'https://images.pexels.com/photos/3912578/pexels-photo-3912578.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'I\'m planning to try it next week. Any tips on application rates?',
      createdAt: '2023-05-10T14:35:00Z',
    },
  ],
  room2: [
    {
      id: 'msg4',
      senderId: '3',
      senderName: 'Agricultural Expert',
      senderAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'The forecast shows rain next week. Plan your harvesting accordingly.',
      createdAt: '2023-05-09T10:15:00Z',
    },
  ],
  room3: [
    {
      id: 'msg5',
      senderId: '6',
      senderName: 'Green Farming Initiative',
      senderAvatar: 'https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: 'Market day is moved to Saturday this week due to the festival.',
      createdAt: '2023-05-08T16:45:00Z',
    },
  ],
};

// Service methods
const getChatRooms = async () => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockChatRooms;
};

const getMessages = async (roomId) => {
  await new Promise((resolve) => setTimeout(resolve, 800));
  return mockMessages[roomId] || [];
};

const sendMessage = async (roomId, content) => {
  await new Promise((resolve) => setTimeout(resolve, 800));

  const newMessage = {
    id: Math.random().toString(36).substring(2, 10),
    senderId: '1',
    senderName: 'Demo Farmer',
    senderAvatar: 'https://images.pexels.com/photos/3912578/pexels-photo-3912578.jpeg?auto=compress&cs=tinysrgb&w=150',
    content,
    createdAt: new Date().toISOString(),
  };

  return newMessage;
};

const createChatRoom = async (name, participants) => {
  const response = await api.post('/chat/room/create', { name, participants });
  return response.data;
};

// Export service
const chatService = {
  getChatRooms,
  getMessages,
  sendMessage,
  createChatRoom,
};

export default chatService;
