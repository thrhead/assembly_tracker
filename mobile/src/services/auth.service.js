import api, { clearAuthToken } from './api';

const authService = {
    /**
     * Login user
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user, token}>}
     */
    login: async (email, password) => {
        try {
            const response = await api.post('/api/mobile/login', { email, password });
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await api.post('/api/auth/signout');
        } catch (error) {
            // Ignore error
        } finally {
            await clearAuthToken();
        }
    },

    /**
     * Get current user profile
     * @returns {Promise<{user}>}
     */
    getProfile: async () => {
        try {
            const response = await api.get('/api/worker/profile');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Change password
     * @param {string} oldPassword
     * @param {string} newPassword
     * @returns {Promise<{message}>}
     */
    changePassword: async (oldPassword, newPassword) => {
        try {
            const response = await api.put('/api/worker/change-password', {
                oldPassword,
                newPassword,
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default authService;
