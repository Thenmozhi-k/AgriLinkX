import api from './api.js';

// Mock data for development
const mockPosts = [
  {
    id: '1',
    userId: '1',
    userName: 'Demo Farmer',
    userAvatar: 'https://images.pexels.com/photos/3912578/pexels-photo-3912578.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'Just harvested our first batch of organic tomatoes this season! The yield is amazing. #OrganicFarming #Sustainability',
    images: ['https://images.pexels.com/photos/533360/pexels-photo-533360.jpeg?auto=compress&cs=tinysrgb&w=600'],
    likes: 24,
    comments: 5,
    shares: 3,
    createdAt: '2023-05-10T10:30:00Z',
    hashtags: ['OrganicFarming', 'Sustainability'],
  },
  {
    id: '2',
    userId: '3',
    userName: 'Agricultural Expert',
    userAvatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'New study shows that regenerative farming practices can increase soil carbon by up to 25% in just 3 years. This is game-changing for climate-friendly agriculture! #RegenerativeFarming #ClimateAction',
    likes: 56,
    comments: 12,
    shares: 18,
    createdAt: '2023-05-09T15:20:00Z',
    hashtags: ['RegenerativeFarming', 'ClimateAction'],
  },
  {
    id: '3',
    userId: '4',
    userName: 'AgriTech Solutions',
    userAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    content: 'We\'re excited to announce our new IoT-based irrigation system that can reduce water usage by 30% while improving crop yields. Interested farmers can sign up for our beta program. #AgriTech #SmartFarming',
    images: ['https://images.pexels.com/photos/927451/pexels-photo-927451.jpeg?auto=compress&cs=tinysrgb&w=600'],
    likes: 89,
    comments: 23,
    shares: 31,
    createdAt: '2023-05-08T09:15:00Z',
    hashtags: ['AgriTech', 'SmartFarming'],
  },
];

const postService = {
  getFeed: async () => {
    // For demo purposes, using a slight delay to simulate network request
    // const response = await api.get('/post');
    // return response.data;

    // Mock response
    await new Promise(resolve => setTimeout(resolve, 800));
    return mockPosts;
  },

  getUserPosts: async (userId) => {
    const response = await api.get(`/post/user/${userId}`);
    return response.data;
  },

  createPost: async (postData) => {
    // For demo purposes, using a mock response
    // const formData = new FormData();
    // formData.append('content', postData.content);
    // if (postData.hashtags) {
    //   formData.append('hashtags', JSON.stringify(postData.hashtags));
    // }
    // if (postData.images) {
    //   postData.images.forEach(image => {
    //     formData.append('images', image);
    //   });
    // }
    // const response = await api.post('/post/create', formData, {
    //   headers: {
    //     'Content-Type': 'multipart/form-data',
    //   },
    // });
    // return response.data;

    // Mock response
    await new Promise(resolve => setTimeout(resolve, 800));

    const mockNewPost = {
      id: Math.random().toString(36).substring(2, 10),
      userId: '1',
      userName: 'Demo Farmer',
      userAvatar: 'https://images.pexels.com/photos/3912578/pexels-photo-3912578.jpeg?auto=compress&cs=tinysrgb&w=150',
      content: postData.content,
      images: [],
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      hashtags: postData.hashtags || [],
    };

    return mockNewPost;
  },

  likePost: async (postId) => {
    const response = await api.post(`/reactions/add`, { postId, type: 'like' });
    return response.data;
  },

  commentOnPost: async (postId, content) => {
    const response = await api.post(`/comments/add`, { postId, content });
    return response.data;
  },

  sharePost: async (postId, caption) => {
    const response = await api.post(`/share/post/${postId}`, { caption });
    return response.data;
  },
};

export default postService;
