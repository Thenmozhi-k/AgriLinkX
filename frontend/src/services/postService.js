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
      
      // Extract hashtags from content
      if (!postData.hashtags || postData.hashtags.length === 0) {
        const hashtagRegex = /#(\w+)/g;
        const matches = postData.content.match(hashtagRegex);
        
        if (matches) {
          const hashtags = matches.map(tag => tag.substring(1));
          formData.append('hashtags', JSON.stringify(hashtags));
        }
      } else if (postData.hashtags && postData.hashtags.length > 0) {
        formData.append('hashtags', JSON.stringify(postData.hashtags));
      }
      
      if (postData.location) {
        formData.append('location', postData.location);
      }
      
      // Add files if they exist - handle both single file and array of files
      if (postData.media) {
        if (Array.isArray(postData.media)) {
          // Multiple files
          postData.media.forEach((file, index) => {
            if (file instanceof File) {
              console.log(`Appending file ${index} to form data:`, file.name, file.type, file.size);
              formData.append('media', file, file.name);
            }
          });
        } else if (postData.media instanceof File) {
          // Single file
          console.log('Appending single file to form data:', postData.media.name, postData.media.type, postData.media.size);
          formData.append('media', postData.media, postData.media.name);
        }
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
      // Create form data for file uploads
      const formData = new FormData();
      
      // Add text fields
      if (postData.description !== undefined) {
        formData.append('description', postData.description);
      }
      
      if (postData.location !== undefined) {
        formData.append('location', postData.location);
      }
      
      // Add hashtags if provided
      if (postData.hashtags && postData.hashtags.length > 0) {
        formData.append('hashtags', JSON.stringify(postData.hashtags));
      }
      
      // Add media files if provided
      if (postData.media && postData.media.length > 0) {
        postData.media.forEach(file => {
          formData.append('media', file);
        });
      }
      
      // Add media IDs to remove if provided
      if (postData.removeMedia && postData.removeMedia.length > 0) {
        formData.append('removeMedia', JSON.stringify(postData.removeMedia));
      }
      
      // Log form data entries for debugging
      for (let [key, value] of formData.entries()) {
        console.log(`Form data entry - ${key}:`, value);
      }
      
      const response = await api.patch(`/post/${postId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return response.data;
    } catch (error) {
      console.error("Error updating post:", error.response?.data || error);
      throw error.response?.data || { message: "Error updating post" };
    }
  },

  deletePost: async (postId) => {
    try {
      const response = await api.delete(`/post/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error deleting post:", error.response?.data || error);
      throw error.response?.data || { message: "Error deleting post" };
    }
  },

  reactToPost: async (postId, reactionType) => {
    try {
      console.log('Reacting to post:', { postId, reactionType });
      
      // Ensure the reaction type is valid
      const validReactionTypes = ['like', 'love', 'care', 'haha', 'wow', 'sad', 'angry'];
      if (!validReactionTypes.includes(reactionType)) {
        console.error('Invalid reaction type:', reactionType);
        throw new Error(`Invalid reaction type: ${reactionType}`);
      }
      
      const response = await api.post(`/post/${postId}/react`, { type: reactionType });
      console.log('Reaction response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error reacting to post:', error.response?.data || error.message);
      throw error;
    }
  },

  getReactionDetails: async (postId) => {
    try {
      const response = await api.get(`/post/${postId}/reactions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching reaction details:', error.response?.data || error.message);
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
      return response.data;
    } catch (error) {
      console.error('Error fetching comments:', error.response?.data || error.message);
      throw error;
    }
  },

  likeComment: async (commentId) => {
    try {
      const response = await api.post(`/post/comment/${commentId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking comment:', error.response?.data || error.message);
      throw error;
    }
  },

  replyToComment: async (commentId, content) => {
    try {
      const response = await api.post(`/post/comment/${commentId}/reply`, { content });
      return response.data;
    } catch (error) {
      console.error('Error replying to comment:', error.response?.data || error.message);
      throw error;
    }
  },

  sharePost: async (postId, userIds) => {
    try {
      const response = await api.post(`/post/${postId}/share`, { userIds });
      return response.data;
    } catch (error) {
      console.error("Error sharing post:", error.response?.data || error);
      throw error.response?.data || { message: "Error sharing post" };
    }
  },

  getShareConnections: async () => {
    try {
      const response = await api.get('/post/share/connections');
      return response.data;
    } catch (error) {
      console.error('Error fetching connections:', error.response?.data || error.message);
      throw error;
    }
  },
  
  searchUsers: async (query) => {
    try {
      const response = await api.get(`/post/share/search?q=${query}`);
      return response.data;
    } catch (error) {
      console.error("Error searching users:", error.response?.data || error);
      throw error.response?.data || { message: "Error searching users" };
    }
  },
  
  savePost: async (postId) => {
    try {
      const response = await api.post(`/saved-posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error saving post:", error.response?.data || error);
      throw error.response?.data || { message: "Error saving post" };
    }
  },
  
  unsavePost: async (postId) => {
    try {
      const response = await api.delete(`/saved-posts/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error unsaving post:", error.response?.data || error);
      throw error.response?.data || { message: "Error unsaving post" };
    }
  },
  
  checkSavedPost: async (postId) => {
    try {
      const response = await api.get(`/saved-posts/check/${postId}`);
      return response.data;
    } catch (error) {
      console.error("Error checking saved post:", error.response?.data || error);
      throw error.response?.data || { message: "Error checking saved post" };
    }
  },
  
  getSavedPosts: async () => {
    try {
      const response = await api.get('/saved-posts');
      return response.data;
    } catch (error) {
      console.error("Error fetching saved posts:", error.response?.data || error);
      throw error.response?.data || { message: "Error fetching saved posts" };
    }
  }
};

export default postService;