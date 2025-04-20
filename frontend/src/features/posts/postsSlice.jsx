import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/postService';

const initialState = {
  feed: [],
  userPosts: [],
  currentPost: null,
  reactionDetails: null,
  shareConnections: [],
  searchResults: [],
  savedPosts: [],
  isLoading: false,
  error: null,
};

// Async thunk for fetching feed
export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async (_, { rejectWithValue }) => {
    try {
      return await postService.getFeed();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch feed');
    }
  }
);

// Async thunk for fetching all posts
export const fetchAllPosts = createAsyncThunk(
  'posts/fetchAllPosts',
  async (_, { rejectWithValue }) => {
    try {
      return await postService.getAllPosts();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch all posts');
    }
  }
);

// Async thunk for fetching user posts
export const fetchUserPosts = createAsyncThunk(
  'posts/fetchUserPosts',
  async (userId, { rejectWithValue }) => {
    try {
      return await postService.getUserPosts(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user posts');
    }
  }
);

// Async thunk for creating a post
export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData, { rejectWithValue }) => {
    try {
      const response = await postService.createPost(postData);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// Async thunk for reacting to a post
export const reactToPost = createAsyncThunk(
  'posts/reactToPost',
  async ({ postId, reactionType }, { rejectWithValue }) => {
    try {
      console.log('Redux thunk: reacting to post', { postId, reactionType });
      return await postService.reactToPost(postId, reactionType);
    } catch (error) {
      console.error('Redux thunk: reaction failed', error);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to react to post');
    }
  }
);

// Async thunk for commenting on a post
export const commentOnPost = createAsyncThunk(
  'posts/commentOnPost',
  async ({ postId, content }, { rejectWithValue }) => {
    try {
      return await postService.commentOnPost(postId, content);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to comment on post');
    }
  }
);

// Async thunk for liking a comment
export const likeComment = createAsyncThunk(
  'posts/likeComment',
  async (commentId, { rejectWithValue }) => {
    try {
      return await postService.likeComment(commentId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like comment');
    }
  }
);

// Async thunk for replying to a comment
export const replyToComment = createAsyncThunk(
  'posts/replyToComment',
  async ({ commentId, content }, { rejectWithValue }) => {
    try {
      return await postService.replyToComment(commentId, content);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reply to comment');
    }
  }
);

// Async thunk for sharing a post (legacy, now redirects to sharePostWithUsers)
export const sharePost = createAsyncThunk(
  'posts/sharePost',
  async (postId, { dispatch, getState }) => {
    try {
      // Fetch connections first
      await dispatch(fetchShareConnections()).unwrap();
      
      // Get the first few connections from state
      const { shareConnections } = getState().posts;
      const userIds = shareConnections.slice(0, 3).map(user => user._id);
      
      if (userIds.length === 0) {
        throw new Error('No connections available to share with');
      }
      
      // Share with selected connections
      return dispatch(sharePostWithUsers({ postId, userIds })).unwrap();
    } catch (error) {
      throw error;
    }
  }
);

// Async thunk for fetching a single post
export const fetchPost = createAsyncThunk(
  'posts/fetchPost',
  async (postId, { rejectWithValue }) => {
    try {
      return await postService.getPost(postId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch post');
    }
  }
);

// Async thunk for deleting a post
export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (postId, { rejectWithValue }) => {
    try {
      await postService.deletePost(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for fetching reaction details
export const fetchReactionDetails = createAsyncThunk(
  'posts/fetchReactionDetails',
  async (postId, { rejectWithValue }) => {
    try {
      return await postService.getReactionDetails(postId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reaction details');
    }
  }
);

// Async thunk for sharing a post with specific users
export const sharePostWithUsers = createAsyncThunk(
  'posts/sharePostWithUsers',
  async ({ postId, userIds }, { rejectWithValue }) => {
    try {
      return await postService.sharePost(postId, userIds);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to share post');
    }
  }
);

// Async thunk for fetching share connections
export const fetchShareConnections = createAsyncThunk(
  'posts/fetchShareConnections',
  async (_, { rejectWithValue }) => {
    try {
      return await postService.getShareConnections();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch connections');
    }
  }
);

// Async thunk for searching users
export const searchUsers = createAsyncThunk(
  'posts/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      return await postService.searchUsers(query);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users');
    }
  }
);

// Async thunk for updating a post
export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ postId, postData }, { rejectWithValue }) => {
    try {
      const updatedPost = await postService.updatePost(postId, postData);
      return updatedPost;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for saving a post
export const savePost = createAsyncThunk(
  'posts/savePost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.savePost(postId);
      return { postId, data: response };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for un-saving a post
export const unsavePost = createAsyncThunk(
  'posts/unsavePost',
  async (postId, { rejectWithValue }) => {
    try {
      await postService.unsavePost(postId);
      return postId;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for checking if a post is saved
export const checkSavedPost = createAsyncThunk(
  'posts/checkSavedPost',
  async (postId, { rejectWithValue }) => {
    try {
      const response = await postService.checkSavedPost(postId);
      return { postId, isSaved: response.isSaved };
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Async thunk for getting all saved posts
export const getSavedPosts = createAsyncThunk(
  'posts/getSavedPosts',
  async (_, { rejectWithValue }) => {
    try {
      const savedPosts = await postService.getSavedPosts();
      return savedPosts;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPostsState: (state) => {
      state.feed = [];
      state.userPosts = [];
      state.currentPost = null;
      state.isLoading = false;
      state.error = null;
    },
    setCurrentPost: (state, action) => {
      state.currentPost = action.payload;
    },
    setSavedStatus: (state, action) => {
      const { postId, isSaved } = action.payload;
      
      // Update in feed
      const feedPost = state.feed.find(post => post._id === postId);
      if (feedPost) {
        feedPost.isSaved = isSaved;
      }
      
      // Update in userPosts
      const userPost = state.userPosts.find(post => post._id === postId);
      if (userPost) {
        userPost.isSaved = isSaved;
      }
      
      // Update currentPost if it matches
      if (state.currentPost && state.currentPost._id === postId) {
        state.currentPost.isSaved = isSaved;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch feed
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed = action.payload;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch all posts
      .addCase(fetchAllPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed = action.payload;
      })
      .addCase(fetchAllPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch user posts
      .addCase(fetchUserPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPosts = action.payload;
      })
      .addCase(fetchUserPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create post
      .addCase(createPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.feed = [action.payload, ...state.feed];
        state.userPosts = [action.payload, ...state.userPosts];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // React to post
      .addCase(reactToPost.fulfilled, (state, action) => {
        const { postId, reactions, totalReactions, userReaction } = action.payload;
        
        // Update in feed
        const feedPost = state.feed.find(post => post._id === postId || post.id === postId);
        if (feedPost) {
          feedPost.reactionCounts = reactions;
          feedPost.totalReactions = totalReactions;
          feedPost.userReaction = userReaction;
        }
        
        // Update in userPosts
        const userPost = state.userPosts.find(post => post._id === postId || post.id === postId);
        if (userPost) {
          userPost.reactionCounts = reactions;
          userPost.totalReactions = totalReactions;
          userPost.userReaction = userReaction;
        }
        
        // Update currentPost if it's the same post
        if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
          state.currentPost.reactionCounts = reactions;
          state.currentPost.totalReactions = totalReactions;
          state.currentPost.userReaction = userReaction;
        }
      })
      .addCase(reactToPost.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Comment on post
      .addCase(commentOnPost.fulfilled, (state, action) => {
        const { postId, comment } = action.payload;
        
        // Update in feed
        const feedPost = state.feed.find(post => post._id === postId || post.id === postId);
        if (feedPost) {
          if (!feedPost.comments) feedPost.comments = [];
          feedPost.comments.push(comment);
          feedPost.commentCount = (feedPost.commentCount || 0) + 1;
        }
        
        // Update in userPosts
        const userPost = state.userPosts.find(post => post._id === postId || post.id === postId);
        if (userPost) {
          if (!userPost.comments) userPost.comments = [];
          userPost.comments.push(comment);
          userPost.commentCount = (userPost.commentCount || 0) + 1;
        }
        
        // Update currentPost if it's the same post
        if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
          if (!state.currentPost.comments) state.currentPost.comments = [];
          state.currentPost.comments.push(comment);
          state.currentPost.commentCount = (state.currentPost.commentCount || 0) + 1;
        }
      })
      .addCase(commentOnPost.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Like comment
      .addCase(likeComment.fulfilled, (state, action) => {
        const { commentId, likeCount, userLiked } = action.payload;
        
        // Helper function to update comment in a post
        const updateCommentInPost = (post) => {
          if (!post || !post.comments) return;
          
          // Find the comment in the post's comments
          const comment = post.comments.find(c => c._id === commentId || c.id === commentId);
          if (comment) {
            comment.likeCount = likeCount;
            comment.userLiked = userLiked;
          }
        };
        
        // Update in all posts
        state.feed.forEach(updateCommentInPost);
        state.userPosts.forEach(updateCommentInPost);
        if (state.currentPost) updateCommentInPost(state.currentPost);
      })
      .addCase(likeComment.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Reply to comment
      .addCase(replyToComment.fulfilled, (state, action) => {
        const { commentId, reply } = action.payload;
        
        // Helper function to update comment in a post
        const updateCommentInPost = (post) => {
          if (!post || !post.comments) return;
          
          // Find the comment in the post's comments
          const comment = post.comments.find(c => c._id === commentId || c.id === commentId);
          if (comment) {
            if (!comment.replies) comment.replies = [];
            comment.replies.push(reply);
          }
        };
        
        // Update in all posts
        state.feed.forEach(updateCommentInPost);
        state.userPosts.forEach(updateCommentInPost);
        if (state.currentPost) updateCommentInPost(state.currentPost);
      })
      .addCase(replyToComment.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Share post
      .addCase(sharePost.fulfilled, (state, action) => {
        const { postId, shareCount } = action.payload;
        
        // Update in feed
        const feedPost = state.feed.find(post => post._id === postId || post.id === postId);
        if (feedPost) {
          feedPost.shareCount = shareCount;
        }
        
        // Update in userPosts
        const userPost = state.userPosts.find(post => post._id === postId || post.id === postId);
        if (userPost) {
          userPost.shareCount = shareCount;
        }
        
        // Update currentPost if it's the same post
        if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
          state.currentPost.shareCount = shareCount;
        }
      })
      .addCase(sharePost.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch post
      .addCase(fetchPost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPost.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentPost = action.payload;
      })
      .addCase(fetchPost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Delete post
      .addCase(deletePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deletePost.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove the post from feed
        state.feed = state.feed.filter(post => post._id !== action.payload);
        // Remove from userPosts
        state.userPosts = state.userPosts.filter(post => post._id !== action.payload);
        // Clear currentPost if it matches
        if (state.currentPost && state.currentPost._id === action.payload) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to delete post';
      })
      // Save post
      .addCase(savePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(savePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const { postId } = action.payload;
        
        // Update in feed
        const feedPost = state.feed.find(post => post._id === postId);
        if (feedPost) {
          feedPost.isSaved = true;
        }
        
        // Update in userPosts
        const userPost = state.userPosts.find(post => post._id === postId);
        if (userPost) {
          userPost.isSaved = true;
        }
        
        // Update currentPost if it matches
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.isSaved = true;
        }
      })
      .addCase(savePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to save post';
      })
      // Unsave post
      .addCase(unsavePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unsavePost.fulfilled, (state, action) => {
        state.isLoading = false;
        const postId = action.payload;
        
        // Update in feed
        const feedPost = state.feed.find(post => post._id === postId);
        if (feedPost) {
          feedPost.isSaved = false;
        }
        
        // Update in userPosts
        const userPost = state.userPosts.find(post => post._id === postId);
        if (userPost) {
          userPost.isSaved = false;
        }
        
        // Update currentPost if it matches
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.isSaved = false;
        }
        
        // Remove from savedPosts if present
        if (state.savedPosts) {
          state.savedPosts = state.savedPosts.filter(post => post._id !== postId);
        }
      })
      .addCase(unsavePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to unsave post';
      })
      // Check saved post
      .addCase(checkSavedPost.fulfilled, (state, action) => {
        const { postId, isSaved } = action.payload;
        
        // Update in feed
        const feedPost = state.feed.find(post => post._id === postId);
        if (feedPost) {
          feedPost.isSaved = isSaved;
        }
        
        // Update in userPosts
        const userPost = state.userPosts.find(post => post._id === postId);
        if (userPost) {
          userPost.isSaved = isSaved;
        }
        
        // Update currentPost if it matches
        if (state.currentPost && state.currentPost._id === postId) {
          state.currentPost.isSaved = isSaved;
        }
      })
      // Get saved posts
      .addCase(getSavedPosts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getSavedPosts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.savedPosts = action.payload;
      })
      .addCase(getSavedPosts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to fetch saved posts';
      })
      // Fetch reaction details
      .addCase(fetchReactionDetails.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchReactionDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.reactionDetails = action.payload;
      })
      .addCase(fetchReactionDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Share post with users
      .addCase(sharePostWithUsers.fulfilled, (state, action) => {
        const { postId, shareCount } = action.payload;
        
        // Update in feed
        const feedPost = state.feed.find(post => post._id === postId || post.id === postId);
        if (feedPost) {
          feedPost.shareCount = shareCount;
        }
        
        // Update in userPosts
        const userPost = state.userPosts.find(post => post._id === postId || post.id === postId);
        if (userPost) {
          userPost.shareCount = shareCount;
        }
        
        // Update currentPost if it's the same post
        if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
          state.currentPost.shareCount = shareCount;
        }
      })
      .addCase(sharePostWithUsers.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Fetch share connections
      .addCase(fetchShareConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchShareConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.shareConnections = action.payload;
      })
      .addCase(fetchShareConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update post
      .addCase(updatePost.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updatePost.fulfilled, (state, action) => {
        state.isLoading = false;
        // Update the post in the feed array
        const index = state.feed.findIndex(post => post._id === action.payload._id);
        if (index !== -1) {
          state.feed[index] = action.payload;
        }
        // Update the post in the userPosts array
        const userIndex = state.userPosts.findIndex(post => post._id === action.payload._id);
        if (userIndex !== -1) {
          state.userPosts[userIndex] = action.payload;
        }
        // Update currentPost if it's the same post
        if (state.currentPost && (state.currentPost._id === action.payload._id)) {
          state.currentPost = action.payload;
        }
      })
      .addCase(updatePost.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Failed to update post';
      });
  },
});

export const { clearPostsState, setCurrentPost, setSavedStatus } = postsSlice.actions;
export default postsSlice.reducer;