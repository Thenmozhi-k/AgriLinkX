import api from './api.js';

const postService = {
  getFeed: async () => {
    try {
      const response = await api.get('/post/feed');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching feed:', error.response?.data || error.message);
      throw error;
    }
  },

  getAllPosts: async () => {
    try {
      const response = await api.get('/post/all');
      return response.data || [];
    } catch (error) {
      console.error('Error fetching all posts:', error.response?.data || error.message);
      throw error;
    }
  },

  getUserPosts: async (userId) => {
    try {
      const response = await api.get(`/post/user/${userId}`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user posts:', error.response?.data || error.message);
      throw error;
    }
  },

  getPost: async (postId) => {
    try {
      const response = await api.get(`/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching post:', error.response?.data || error.message);
      throw error;
    }
  },

  createPost: async (postData) => {
    try {
      console.log('Creating post with data:', postData);
      
      // Create FormData object for multipart/form-data
      const formData = new FormData();
      
      // Add text fields
      formData.append('description', postData.content);
      
      if (postData.hashtags && postData.hashtags.length > 0) {
        formData.append('hashtags', JSON.stringify(postData.hashtags));
      }
      
      if (postData.location) {
        formData.append('location', postData.location);
      }
      
      // Add file if it exists - this is the critical part
      if (postData.media && postData.media instanceof File) {
        console.log('Appending file to form data:', postData.media.name, postData.media.type, postData.media.size);
        formData.append('media', postData.media, postData.media.name);
      }
      
      // Log the form data entries for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`Form data entry - ${key}:`, value instanceof File ? `File: ${value.name}` : value);
      }
      
      // Send the request with the correct content type
      const response = await api.post('/post/create', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error.response?.data || error.message);
      throw error;
    }
  },

  updatePost: async (postId, postData) => {
    try {
      const formData = new FormData();
      formData.append('description', postData.content);
      
      if (postData.hashtags && postData.hashtags.length > 0) {
        formData.append('hashtags', JSON.stringify(postData.hashtags));
      }
      
      if (postData.location) {
        formData.append('location', postData.location);
      }
      
      // Add file if it exists
      if (postData.media && postData.media instanceof File) {
        console.log('Appending file to form data:', postData.media.name, postData.media.type, postData.media.size);
        formData.append('media', postData.media, postData.media.name);
      }
      
      const response = await api.put(`/post/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data;
    } catch (error) {
      console.error('Error updating post:', error.response?.data || error.message);
      throw error;
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting post:', error.response?.data || error.message);
      throw error;
    }
  },

  likePost: async (postId) => {
    try {
      const response = await api.post(`/post/${postId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking post:', error.response?.data || error.message);
      throw error;
    }
  },

  commentOnPost: async (postId, content) => {
    try {
      const response = await api.post(`/post/${postId}/comment`, { content });
      return response.data;
    } catch (error) {
      console.error('Error commenting on post:', error.response?.data || error.message);
      throw error;
    }
  },

  getComments: async (postId) => {
    try {
      const response = await api.get(`/post/${postId}/comments`);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching comments:', error.response?.data || error.message);
      throw error;
    }
  },

  sharePost: async (postId, caption) => {
    try {
      const response = await api.post(`/post/${postId}/share`, { caption });
      return response.data;
    } catch (error) {
      console.error('Error sharing post:', error.response?.data || error.message);
      throw error;
    }
  }
};

export default postService;