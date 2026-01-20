import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { QueueService } from './QueueService';
import { ToastService } from './ToastService';

// This value is updated automatically by start_tunnel_auto.ps1
const NGROK_URL = 'https://adjustment-wilderness-midnight-recordings.trycloudflare.com';

const getBaseUrl = () => {
    // Check if we have a production URL defined in environment variables (for EAS builds)
    const prodUrl = process.env.EXPO_PUBLIC_API_URL;
    if (prodUrl && !__DEV__) {
        return prodUrl;
    }

    // For web (react-native-web), use the same host that serves the app in dev, 
    // but LIVE backend in production
    if (Platform.OS === 'web') {
        if (__DEV__) {
            if (typeof window !== 'undefined' && window.location) {
                const host = window.location.hostname;
                return `http://${host}:3000`;
            }
            return 'http://localhost:3000';
        }
        return 'https://assemblyweb.vercel.app';
    }

    // Hardcoded LAN IP for physical device testing in development
    if (__DEV__) {
        return 'http://192.168.1.173:3000';
    }

    // Fallback for production if no env var is set
    return 'https://assemblyweb.vercel.app';
};

export const API_BASE_URL = getBaseUrl();

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
            const netState = await NetInfo.fetch();

            // Offline Cache Logic: Check if we are offline and have cached data for GET requests
            if (config.method === 'get') {
                if (!netState.isConnected) {
                    const cacheKey = `cache_request_${config.url}_${JSON.stringify(config.params)}`;
                    const cachedString = await AsyncStorage.getItem(cacheKey);
                    if (cachedString) {
                        const cachedData = JSON.parse(cachedString);
                        console.log(`[API] Offline - serving from cache: ${config.url}`);
                        throw {
                            __isOfflineCached: true,
                            response: cachedData
                        };
                    }
                }
            }

            // Action Queue Logic: Queue non-GET requests when offline
            const writeMethods = ['post', 'put', 'patch', 'delete'];
            if (writeMethods.includes(config.method.toLowerCase()) && !netState.isConnected) {
                console.log(`[API] Offline - queueing ${config.method.toUpperCase()} request: ${config.url}`);
                const queueItem = {
                    type: config.method.toUpperCase(),
                    url: config.url,
                    payload: config.data,
                    headers: config.headers,
                };
                await QueueService.addItem(queueItem);

                // Show UI feedback
                ToastService.show('Çevrimdışı Kaydedildi', 'İşlem kuyruğa alındı ve bağlantı sağlandığında gönderilecek.', 'warning');

                // Throw special error to be handled as successful (but queued) response
                throw {
                    __isQueued: true,
                    config
                };
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
            // Propagate special offline errors immediately
            if (error.__isOfflineCached || error.__isQueued) {
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
        // Handle Offline Queued Request
        if (error.__isQueued) {
            return Promise.resolve({
                status: 202,
                statusText: 'Accepted (Queued)',
                data: {
                    message: 'İşlem kuyruğa alındı ve bağlantı sağlandığında gönderilecek.',
                    offline: true,
                },
                config: error.config,
                headers: {},
            });
        }

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
