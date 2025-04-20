import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import chatService from '../../services/chatService';

// Initial state
const initialState = {
  rooms: [],
  currentRoom: null,
  messages: [],
  isLoading: false,
  error: null,
};

// Async thunk: fetch chat rooms
export const fetchChatRooms = createAsyncThunk(
  'chat/fetchChatRooms',
  async (_, { rejectWithValue }) => {
    try {
      return await chatService.getChatRooms();
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch chat rooms');
    }
  }
);

// Async thunk: fetch messages for a room
export const fetchMessages = createAsyncThunk(
  'chat/fetchMessages',
  async (roomId, { rejectWithValue }) => {
    try {
      return await chatService.getMessages(roomId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch messages');
    }
  }
);

// Async thunk: send a message
export const sendMessage = createAsyncThunk(
  'chat/sendMessage',
  async ({ roomId, content }, { rejectWithValue }) => {
    try {
      return await chatService.sendMessage(roomId, content);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to send message');
    }
  }
);

// Async thunk: create a chat room
export const createChatRoom = createAsyncThunk(
  'chat/createChatRoom',
  async ({ name, participants }, { rejectWithValue }) => {
    try {
      return await chatService.createChatRoom(name, participants);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create chat room');
    }
  }
);

// Async thunk: get or create a direct chat with a user
export const getDirectChat = createAsyncThunk(
  'chat/getDirectChat',
  async (userId, { rejectWithValue }) => {
    try {
      return await chatService.getDirectChat(userId);
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to get direct chat');
    }
  }
);

// Async thunk: mark a chat room as read
export const markRoomAsRead = createAsyncThunk(
  'chat/markRoomAsRead',
  async (roomId, { rejectWithValue }) => {
    try {
      await chatService.markRoomAsRead(roomId);
      return roomId;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to mark room as read');
    }
  }
);

// Chat slice
const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    setCurrentRoom: (state, action) => {
      state.currentRoom = action.payload;
    },
    clearChatError: (state) => {
      state.error = null;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch chat rooms
      .addCase(fetchChatRooms.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch messages
      .addCase(fetchMessages.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchMessages.fulfilled, (state, action) => {
        state.isLoading = false;
        state.messages = action.payload;
      })
      .addCase(fetchMessages.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Send message
      .addCase(sendMessage.pending, (state) => {
        state.error = null;
      })
      .addCase(sendMessage.fulfilled, (state, action) => {
        state.messages = [...state.messages, action.payload];
        
        // Update last message in the current room
        if (state.currentRoom) {
          state.currentRoom.lastMessage = action.payload.content;
          state.currentRoom.lastMessageTime = action.payload.createdAt;
          
          // Also update in rooms list
          const roomIndex = state.rooms.findIndex(room => 
            room._id === state.currentRoom._id || room.id === state.currentRoom.id
          );
          
          if (roomIndex !== -1) {
            state.rooms[roomIndex].lastMessage = action.payload.content;
            state.rooms[roomIndex].lastMessageTime = action.payload.createdAt;
          }
        }
      })
      .addCase(sendMessage.rejected, (state, action) => {
        state.error = action.payload;
      })
      // Create chat room
      .addCase(createChatRoom.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createChatRoom.fulfilled, (state, action) => {
        state.isLoading = false;
        state.rooms = [action.payload, ...state.rooms];
        state.currentRoom = action.payload;
      })
      .addCase(createChatRoom.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Get direct chat
      .addCase(getDirectChat.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getDirectChat.fulfilled, (state, action) => {
        state.isLoading = false;
        
        // Check if the room already exists in our list
        const existingRoomIndex = state.rooms.findIndex(room => 
          room._id === action.payload._id || room.id === action.payload.id
        );
        
        if (existingRoomIndex === -1) {
          // Add to rooms if it doesn't exist
          state.rooms = [action.payload, ...state.rooms];
        } else {
          // Update the room if it exists
          state.rooms[existingRoomIndex] = action.payload;
        }
        
        state.currentRoom = action.payload;
      })
      .addCase(getDirectChat.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Mark room as read
      .addCase(markRoomAsRead.fulfilled, (state, action) => {
        const roomId = action.payload;
        
        // Update unread count in rooms list
        const roomIndex = state.rooms.findIndex(room => 
          room._id === roomId || room.id === roomId
        );
        
        if (roomIndex !== -1) {
          state.rooms[roomIndex].unreadCount = 0;
        }
        
        // Update current room if it's the same
        if (state.currentRoom && (state.currentRoom._id === roomId || state.currentRoom.id === roomId)) {
          state.currentRoom.unreadCount = 0;
        }
      });
  },
});

export const { setCurrentRoom, clearChatError, clearMessages } = chatSlice.actions;
export default chatSlice.reducer;