import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

let storeRef = null;

export const setStore = (store) => {
  storeRef = store;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = storeRef?.getState()?.auth?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (storeRef) {
        storeRef.dispatch({ type: 'auth/logout/fulfilled' });
      }
    }

    return Promise.reject(error);
  }
);

export default api;
