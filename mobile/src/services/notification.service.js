import api from './api';

const notificationService = {
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
