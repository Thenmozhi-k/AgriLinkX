import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { CustomPersistGate } from './app/CustomPersistGate.js';
import App from './App.js';
import { store, persistor } from './app/store.js';
import './index.css';
// Import the setStore function from api.js
import { setStore } from './services/api.js';

// Initialize the API service with the store
setStore(store);

// Create React Root and render the app
createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <CustomPersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </CustomPersistGate>
    </Provider>
  </React.StrictMode>
);

