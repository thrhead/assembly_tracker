import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// This value is updated automatically by start_tunnel_auto.ps1
const NGROK_URL = 'https://adjustment-wilderness-midnight-recordings.trycloudflare.com';

const getBaseUrl = () => {
    // For web (react-native-web), always use localhost
    if (Platform.OS === 'web') {
        return 'http://localhost:3000';
    }

    // Hardcoded LAN IP for physical device testing
    return 'http://192.168.1.173:3000';

    /* Tunnel logic disabled for now to simplify
    if (NGROK_URL) return NGROK_URL;
    if (Platform.OS === 'android') return 'http://10.0.2.2:3000';
    return 'http://localhost:3000';
    */
};

export const API_BASE_URL = __DEV__ ? getBaseUrl() : 'https://your-production-url.com';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let logoutCallback = null;

export const registerLogoutCallback = (callback) => {
    logoutCallback = callback;
};

// Request interceptor
api.interceptors.request.use(
    async (config) => {
        try {
            // Offline Cache Logic: Check if we are offline and have cached data for GET requests
            if (config.method === 'get') {
                const netState = await NetInfo.fetch();
                if (!netState.isConnected) {
                    const cacheKey = `cache_request_${config.url}_${JSON.stringify(config.params)}`;
                    const cachedString = await AsyncStorage.getItem(cacheKey);
                    if (cachedString) {
                        const cachedData = JSON.parse(cachedString);
                        console.log(`[API] Offline - serving from cache: ${config.url}`);
                        // Throw a special error that carries the cached response
                        // This will be caught by the response error interceptor
                        throw {
                            __isOfflineCached: true,
                            response: cachedData
                        };
                    }
                }
            }

            if (!config.headers.Authorization) {
                const token = await AsyncStorage.getItem('authToken');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            }
            if (__DEV__) {
                console.log(`[API] ${config.method.toUpperCase()} ${config.url}`);
            }
        } catch (error) {
            // Propagate special offline error immediately
            if (error.__isOfflineCached) {
                return Promise.reject(error);
            }
            console.error('Error getting auth token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
    async (response) => {
        // Cache successful GET requests
        if (response.config.method === 'get' && response.status >= 200 && response.status < 300) {
            try {
                const cacheKey = `cache_request_${response.config.url}_${JSON.stringify(response.config.params)}`;
                // We store the whole response structure we care about
                const dataToCache = {
                    data: response.data,
                    status: response.status,
                    statusText: response.statusText,
                    headers: response.headers,
                };
                await AsyncStorage.setItem(cacheKey, JSON.stringify(dataToCache));
            } catch (e) {
                console.warn('[API] Failed to cache response:', e);
            }
        }
        return response;
    },
    async (error) => {
        // Handle Offline Cached Response
        if (error.__isOfflineCached && error.response) {
            return Promise.resolve({
                ...error.response,
                config: {}, // We can't easily reconstruct strict config but usually not needed for UI
            });
        }

        if (error.response) {
            const { status, data } = error.response;

            if (status === 401) {
                await AsyncStorage.removeItem('authToken');
                await AsyncStorage.removeItem('user');
                if (logoutCallback) logoutCallback();
            }

            if (__DEV__ && status >= 400) {
                console.error(`[API Error] ${status}:`, data);
            }

            return Promise.reject({
                status,
                message: data.message || data.error || 'An error occurred',
                data: data,
            });
        } else if (error.request) {
            console.error('Network error:', error.message);
            return Promise.reject({
                status: 0,
                message: 'Network error. Please check your connection.',
            });
        } else {
            console.error('Error:', error.message);
            return Promise.reject({
                status: -1,
                message: error.message || 'An unexpected error occurred',
            });
        }
    }
);

// Helpers
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
        return null;
    }
};

export default api;
