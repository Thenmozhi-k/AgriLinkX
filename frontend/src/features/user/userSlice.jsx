import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

const initialState = {
  profile: {
    followers: [],
    following: [],
    suggestions: [],
    userDetails: null,
    followRequests: [],
    mutualConnections: {}
  },
  isLoading: false,
  error: null,
};

// Async thunk for fetching connections
export const fetchConnections = createAsyncThunk(
  'user/fetchConnections',
  async (userId, { rejectWithValue }) => {
    try {
      const [followers, following] = await Promise.all([
        userService.getFollowers(userId),
        userService.getFollowing(userId),
      ]);
      return { followers, following };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch connections');
    }
  }
);

// Async thunk for fetching suggestions
export const fetchSuggestions = createAsyncThunk(
  'user/fetchSuggestions',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getSuggestions();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch suggestions');
    }
  }
);

// Async thunk for following a user
export const followUser = createAsyncThunk(
  'user/followUser',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.followUser(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to follow user');
    }
  }
);

// Async thunk for unfollowing a user
export const unfollowUser = createAsyncThunk(
  'user/unfollowUser',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.unfollowUser(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to unfollow user');
    }
  }
);

// Async thunk for checking following status
export const checkFollowingStatus = createAsyncThunk(
  'user/checkFollowingStatus',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.checkFollowingStatus(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to check following status');
    }
  }
);

// Async thunk for fetching follow requests
export const fetchFollowRequests = createAsyncThunk(
  'user/fetchFollowRequests',
  async (_, { rejectWithValue }) => {
    try {
      return await userService.getFollowRequests();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch follow requests');
    }
  }
);

// Async thunk for accepting a follow request
export const acceptFollowRequest = createAsyncThunk(
  'user/acceptFollowRequest',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.acceptFollowRequest(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept follow request');
    }
  }
);

// Async thunk for rejecting a follow request
export const rejectFollowRequest = createAsyncThunk(
  'user/rejectFollowRequest',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.rejectFollowRequest(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to reject follow request');
    }
  }
);

// Async thunk for searching users
export const searchUsers = createAsyncThunk(
  'user/searchUsers',
  async (query, { rejectWithValue }) => {
    try {
      return await userService.searchUsers(query);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search users');
    }
  }
);

// Async thunk for fetching user profile
export const fetchUserProfile = createAsyncThunk(
  'user/fetchUserProfile',
  async (userId, { rejectWithValue }) => {
    try {
      return await userService.getUserProfile(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user profile');
    }
  }
);

// Async thunk for fetching mutual connections
export const fetchMutualConnections = createAsyncThunk(
  'user/fetchMutualConnections',
  async (userId, { rejectWithValue }) => {
    try {
      const mutualConnections = await userService.getMutualConnections(userId);
      return { userId, mutualConnections };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch mutual connections');
    }
  }
);

// User slice
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserProfile: (state) => {
      state.profile = initialState.profile;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch connections
      .addCase(fetchConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile.followers = action.payload.followers;
        state.profile.following = action.payload.following;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch suggestions
      .addCase(fetchSuggestions.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile.suggestions = action.payload;
      })
      .addCase(fetchSuggestions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Follow user
      .addCase(followUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(followUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // We don't add to following immediately since it's now a request
        // Remove from suggestions if the user was in suggestions
        if (action.payload && (action.payload._id || action.payload.id)) {
          state.profile.suggestions = state.profile.suggestions.filter(
            (suggestion) => 
              suggestion._id !== action.payload._id && 
              suggestion.id !== action.payload.id
          );
        }
      })
      .addCase(followUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Unfollow user
      .addCase(unfollowUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(unfollowUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove from following list if the user was being followed
        if (action.payload && (action.payload._id || action.payload.id)) {
          state.profile.following = state.profile.following.filter(
            (user) => 
              user._id !== action.payload._id && 
              user.id !== action.payload.id
          );
        }
      })
      .addCase(unfollowUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Check following status
      .addCase(checkFollowingStatus.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(checkFollowingStatus.fulfilled, (state) => {
        state.isLoading = false;
        // We don't store the status in state as it's typically used directly in components
      })
      .addCase(checkFollowingStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch follow requests
      .addCase(fetchFollowRequests.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFollowRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile.followRequests = action.payload;
      })
      .addCase(fetchFollowRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Accept follow request
      .addCase(acceptFollowRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(acceptFollowRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // Add to followers list and remove from follow requests
        if (action.payload && (action.payload._id || action.payload.id)) {
          state.profile.followers.push(action.payload);
          state.profile.followRequests = state.profile.followRequests.filter(
            (request) => 
              request._id !== action.payload._id && 
              request.id !== action.payload.id
          );
        }
      })
      .addCase(acceptFollowRequest.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Reject follow request
      .addCase(rejectFollowRequest.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(rejectFollowRequest.fulfilled, (state, action) => {
        state.isLoading = false;
        // Remove from follow requests
        if (action.payload && action.payload.userId) {
          state.profile.followRequests = state.profile.followRequests.filter(
            (request) => 
              request._id !== action.payload.userId && 
              request.id !== action.payload.userId
          );
        }
      })
      .addCase(rejectFollowRequest.rejected, (state, action) => {
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
        // We don't store search results in the state as they're typically displayed temporarily
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch user profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile.userDetails = action.payload;
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch mutual connections
      .addCase(fetchMutualConnections.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMutualConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        // Store mutual connections by userId for caching
        state.profile.mutualConnections = {
          ...state.profile.mutualConnections,
          [action.payload.userId]: action.payload.mutualConnections
        };
      })
      .addCase(fetchMutualConnections.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearUserError, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;