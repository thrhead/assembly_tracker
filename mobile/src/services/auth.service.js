import api, { setAuthToken, clearAuthToken, API_BASE_URL } from './api';

const authService = {
    /**
     * Login user
     * @param {string} email
     * @param {string} password
     * @returns {Promise<{user, token}>}
     */
    login: async (email, password) => {
        try {
            console.log('[AuthContext] Attempting login to:', `${API_BASE_URL}/api/mobile/login`);

            const response = await fetch(`${API_BASE_URL}/api/mobile/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            console.log('[AuthContext] Login response status:', response.status);

            if (!response.ok) {
                throw new Error(data.message || data.error || 'Giriş yapılamadı');
            }

            if (data.token) {
                await setAuthToken(data.token);
            }

            return data;
        } catch (error) {
            console.error('[AuthContext] Login error:', error);
            throw error;
        }
    },

    /**
     * Logout user
     */
    logout: async () => {
        try {
            await api.post('/api/auth/signout');
            await clearAuthToken();
        } catch (error) {
            // Even if API call fails, clear local token
            await clearAuthToken();
            throw error;
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
