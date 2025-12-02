import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// TODO: Update with ngrok URL when using tunnel
// Get ngrok URL by running: ngrok http 3000
// Example: https://abc123-def456.ngrok-free.app
const NGROK_URL = 'https://nonblamably-appreciatory-corban.ngrok-free.dev';

// Determine the correct base URL based on platform
const getBaseUrl = () => {
    // If NGROK_URL is set to a valid URL (not the placeholder), use it
    if (NGROK_URL && NGROK_URL !== 'NGROK_URL_BURAYA' && NGROK_URL.startsWith('http')) {
        console.log('[API] Using Ngrok URL:', NGROK_URL);
        return NGROK_URL;
    }

    // For web (react-native-web), use localhost
    if (Platform.OS === 'web') {
        return 'http://localhost:3000';
    }

    // For Android emulator, use 10.0.2.2
    if (Platform.OS === 'android') {
        return 'http://10.0.2.2:3000';
    }

    // For iOS simulator or physical devices
    // You might want to make this configurable or dynamic
    return 'http://192.168.1.173:3000';
};

const API_BASE_URL = __DEV__ ? getBaseUrl() : 'https://your-production-url.com';

// Create axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Callback for 401 Unauthorized
let logoutCallback = null;

export const registerLogoutCallback = (callback) => {
    logoutCallback = callback;
};

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
    async (config) => {
        try {
            // If header is already set (by setApiHeaderToken), use it.
            // Otherwise, try to get from storage (fallback)
            if (!config.headers.Authorization) {
                const token = await AsyncStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }

            console.log(`[API Request] ${config.method.toUpperCase()} ${config.url}`);
            console.log(`[API Request] Base URL: ${config.baseURL}`);
            console.log('[API Request] Headers:', JSON.stringify(config.headers));
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
                    if (logoutCallback) {
                        logoutCallback();
                    }
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
                    console.error('API error:', data.message || data.error || 'Unknown error');
            }

            return Promise.reject({
                status,
                message: data.message || data.error || 'An error occurred',
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
const setApiHeaderToken = (token) => {
    if (token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
        delete api.defaults.headers.common['Authorization'];
    }
};

export const setAuthToken = async (token) => {
    try {
        await AsyncStorage.setItem('authToken', token);
        setApiHeaderToken(token);
    } catch (error) {
        console.error('Error saving auth token:', error);
    }
};

export const clearAuthToken = async () => {
    try {
        await AsyncStorage.removeItem('authToken');
        await AsyncStorage.removeItem('user');
        setApiHeaderToken(null);
    } catch (error) {
        console.error('Error clearing auth token:', error);
    }
};

export const getAuthToken = async () => {
    try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
            setApiHeaderToken(token);
        }
        return token;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
};

export { API_BASE_URL };
export default api;
