import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Update with ngrok URL when using tunnel
// Get ngrok URL by running: ngrok http 3000
// Example: https://abc123-def456.ngrok-free.app
const NGROK_URL = 'https://nonblamably-appreciatory-corban.ngrok-free.dev';  // ngrok URL'inizi buraya yapıştırın

const API_BASE_URL = __DEV__
    ? (NGROK_URL !== 'NGROK_URL_BURAYA' ? NGROK_URL : 'http://localhost:3000')
    : 'https://your-production-url.com';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('authToken');
            console.log('[API] Interceptor - Token:', token ? 'Present' : 'Missing');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Error getting auth token:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        if (error.response) {
            // Server responded with error status
            const { status, data } = error.response;

            // Handle specific status codes
            switch (status) {
                case 401:
                    // Unauthorized - clear token and redirect to login
                    await AsyncStorage.removeItem('authToken');
                    await AsyncStorage.removeItem('user');
                    break;
                case 403:
                    console.error('Forbidden:', data.message);
                    break;
                case 404:
                    console.error('Not found:', data.message);
                    break;
                case 500:
                    console.error('Server error:', data.message);
                    break;
                default:
                    console.error('API error:', data.message || 'Unknown error');
            }

            return Promise.reject({
                status,
                message: data.message || 'An error occurred',
                data: data,
            });
        } else if (error.request) {
            // Request made but no response
            console.error('Network error:', error.message);
            return Promise.reject({
                status: 0,
                message: 'Network error. Please check your connection.',
            });
        } else {
            // Something else happened
            console.error('Error:', error.message);
            return Promise.reject({
                status: -1,
                message: error.message || 'An unexpected error occurred',
            });
        }
    }
);

// Helper functions
export const setAuthToken = async (token) => {
    try {
        console.log('AsyncStorage.setItem authToken called');
        await AsyncStorage.setItem('authToken', token);
        console.log('AsyncStorage.setItem authToken success');
    } catch (error) {
        console.error('Error saving auth token:', error);
    }
};

export const clearAuthToken = async () => {
    try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
    } catch (error) {
        console.error('Error clearing auth token:', error);
    }
};

export const getAuthToken = async () => {
    try {
        return await AsyncStorage.getItem('authToken');
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

export { API_BASE_URL };
export default api;
