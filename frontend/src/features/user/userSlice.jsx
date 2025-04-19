import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import userService from '../../services/userService';

const initialState = {
  profile: {
    followers: [],
    following: [],
    suggestions: [],
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

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUserError: (state) => {
      state.error = null;
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
      .addCase(fetchSuggestions.fulfilled, (state, action) => {
        state.profile.suggestions = action.payload;
      })
      // Follow user
      .addCase(followUser.fulfilled, (state, action) => {
        state.profile.following = [...state.profile.following, action.payload];
        state.profile.suggestions = state.profile.suggestions.filter(
          (suggestion) => suggestion.id !== action.payload.id
        );
      });
  },
});

export const { clearUserError } = userSlice.actions;
export default userSlice.reducer;
