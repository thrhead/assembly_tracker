import { API_BASE_URL, getAuthToken } from './api';

const getHeaders = async () => {
    const token = await getAuthToken();
    return {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
};

const userService = {
    /**
     * Get all users (Admin only)
     * @param {Object} filters - { role, search }
     * @returns {Promise<Array>}
     */
    getAll: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.role && filters.role !== 'ALL') params.append('role', filters.role);
            if (filters.search) params.append('search', filters.search);

            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/users?${params.toString()}`, {
                method: 'GET',
                headers
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error('Kullanıcılar getirilemedi');
            }

            return await response.json();
        } catch (error) {
            console.error('UserService getAll error:', error);
            throw error;
        }
    },

    /**
     * Create a new user
     * @param {Object} userData
     * @returns {Promise<Object>}
     */
    create: async (userData) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/users`, {
                method: 'POST',
                headers,
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Kullanıcı oluşturulamadı');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update an existing user
     * @param {string} id
     * @param {Object} userData
     * @returns {Promise<Object>}
     */
    update: async (id, userData) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(userData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Güncelleme başarısız');
            }
            return data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a user
     * @param {string} id
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/users/${id}`, {
                method: 'DELETE',
                headers
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Silme başarısız');
            }
            return data;
        } catch (error) {
            throw error;
        }
    }
};

export default userService;
