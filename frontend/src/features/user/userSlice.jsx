import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

const initialState = {
  profile: {
    followers: [],
    following: [],
    suggestions: [],
    userDetails: null
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

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
    },
    clearUserProfile: (state) => {
      state.profile.userDetails = null;
    }
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
        state.profile.following = [...state.profile.following, action.payload];
        state.profile.suggestions = state.profile.suggestions.filter(
          (suggestion) => suggestion._id !== action.payload._id && suggestion.id !== action.payload.id
        );
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
        state.profile.following = state.profile.following.filter(
          (user) => user._id !== action.payload._id && user.id !== action.payload.id
        );
      })
      .addCase(unfollowUser.rejected, (state, action) => {
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
      });
  },
});

export const { clearUserError, clearUserProfile } = userSlice.actions;
export default userSlice.reducer;