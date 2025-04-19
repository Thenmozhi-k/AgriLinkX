// import { configureStore, combineReducers } from '@reduxjs/toolkit';
// import {
//   persistStore,
//   persistReducer,
//   FLUSH,
//   REHYDRATE,
//   PAUSE,
//   PERSIST,
//   PURGE,
//   REGISTER,
// } from 'redux-persist';
// import storage from 'redux-persist/lib/storage';

// // Import your individual slice reducers
// import authReducer from '../features/auth/authSlice';
// import postsReducer from '../features/posts/postsSlice';
// import userReducer from '../features/user/userSlice';
// import chatReducer from '../features/chat/chatSlice';
// import notificationsReducer from '../features/notifications/notificationsSlice';

// // Persist configuration
// const persistConfig = {
//   key: 'root',
//   storage,
//   whitelist: ['auth'], // only 'auth' state will be persisted
// };

// // Combine all feature reducers
// const rootReducer = combineReducers({
//   auth: authReducer,
//   posts: postsReducer,
//   user: userReducer,
//   chat: chatReducer,
//   notifications: notificationsReducer,
// });

// // Apply persistReducer to rootReducer
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // Create the Redux store
// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: {
//         ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
//       },
//     }),
// });

// // Export persistor for PersistGate
// export const persistor = persistStore(store);


// export const getRootState = () => store.getState();
// export const getAppDispatch = () => store.dispatch;


// src/app/store.js
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
// import storage from 'redux-persist/lib/storage/index.js';


// Import your individual slice reducers
import authReducer from '../features/auth/authSlice.jsx';
import postsReducer from '../features/posts/postsSlice.jsx';
import userReducer from '../features/user/userSlice.jsx';
import chatReducer from '../features/chat/chatSlice.jsx';
import notificationsReducer from '../features/notifications/notificationsSlice.jsx';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // only 'auth' state will be persisted
};

// Combine all feature reducers
const rootReducer = combineReducers({
  auth: authReducer,
  posts: postsReducer,
  user: userReducer,
  chat: chatReducer,
  notifications: notificationsReducer,
});

// Apply persistReducer to rootReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the Redux store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

// Export persistor for PersistGate
export const persistor = persistStore(store);

// Utility functions to access state and dispatch directly (if needed)
export const getRootState = () => store.getState();
export const getAppDispatch = () => store.dispatch;