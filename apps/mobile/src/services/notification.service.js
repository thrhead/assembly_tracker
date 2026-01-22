import api from './api';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications behave when the app is in foreground
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
    }),
});

const notificationService = {
    /**
     * Register for Push Notifications
     * @returns {Promise<string>}
     */
    registerForPushNotificationsAsync: async () => {
        let token;

        if (Platform.OS === 'android') {
            await Notifications.setNotificationChannelAsync('default', {
                name: 'default',
                importance: Notifications.AndroidImportance.MAX,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: '#FF231F7C',
            });
        }

        if (Device.isDevice) {
            const { status: existingStatus } = await Notifications.getPermissionsAsync();
            let finalStatus = existingStatus;
            if (existingStatus !== 'granted') {
                const { status } = await Notifications.requestPermissionsAsync();
                finalStatus = status;
            }
            if (finalStatus !== 'granted') {
                console.log('Permission not granted for push notifications');
                return;
            }

            const projectId =
                Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;

            try {
                if (!projectId) {
                    token = (await Notifications.getExpoPushTokenAsync()).data;
                } else {
                    token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
                }

                console.log('Push Token:', token);
                if (token) {
                    await AsyncStorage.setItem('push_token_last', token);
                }
            } catch (e) {
                console.log('Error fetching push token:', e);
            }
        } else {
            console.log('Must use physical device for Push Notifications');
        }

        return token;
    },

    /**
     * Send Push Token to Backend
     * @param {string} token
     * @param {string} userId
     */
    sendPushTokenToBackend: async (token, userId) => {
        if (!token || !userId) return;
        try {
            console.log("Sending push token to backend for user:", userId);
            // Updated to use the new dedicated push token endpoint
            await api.post('/api/user/push-token', {
                token
            });
            console.log("Push token registered successfully");
        } catch (error) {
            console.error("Error sending push token", error);
        }
    },

    /**
     * Get user notifications
     * @returns {Promise<Array>}
     */
    getNotifications: async () => {
        try {
            const response = await api.get('/api/notifications');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mark all notifications as read
     * @returns {Promise<Object>}
     */
    markAllAsRead: async () => {
        try {
            const response = await api.patch('/api/notifications');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Mark a specific notification as read
     * @param {string} id 
     * @returns {Promise<Object>}
     */
    markAsRead: async (id) => {
        try {
            const response = await api.patch('/api/notifications', { id });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default notificationService;
