import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import postService from '../../services/postService';

const initialState = {
  feed: [],
  userPosts: [],
  currentPost: null,
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

// Async thunk for liking a post
export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId, { rejectWithValue }) => {
    try {
      return await postService.likePost(postId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to like post');
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
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearPostsError: (state) => {
      state.error = null;
    },
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
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
      // Like post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        
        // Update in feed
        const feedPost = state.feed.find(post => post._id === postId || post.id === postId);
        if (feedPost) {
          feedPost.likes = likes;
        }
        
        // Update in userPosts
        const userPost = state.userPosts.find(post => post._id === postId || post.id === postId);
        if (userPost) {
          userPost.likes = likes;
        }
        
        // Update currentPost if it's the same post
        if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
          state.currentPost.likes = likes;
        }
      })
      .addCase(likePost.rejected, (state, action) => {
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
        }
        
        // Update in userPosts
        const userPost = state.userPosts.find(post => post._id === postId || post.id === postId);
        if (userPost) {
          if (!userPost.comments) userPost.comments = [];
          userPost.comments.push(comment);
        }
        
        // Update currentPost if it's the same post
        if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
          if (!state.currentPost.comments) state.currentPost.comments = [];
          state.currentPost.comments.push(comment);
        }
      })
      .addCase(commentOnPost.rejected, (state, action) => {
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
      .addCase(deletePost.fulfilled, (state, action) => {
        const postId = action.payload;
        state.feed = state.feed.filter(post => (post._id !== postId && post.id !== postId));
        state.userPosts = state.userPosts.filter(post => (post._id !== postId && post.id !== postId));
        if (state.currentPost && (state.currentPost._id === postId || state.currentPost.id === postId)) {
          state.currentPost = null;
        }
      })
      .addCase(deletePost.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearPostsError, clearCurrentPost } = postsSlice.actions;
export default postsSlice.reducer;