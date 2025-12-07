
import api, { API_BASE_URL, getAuthToken } from './api';

const templateService = {
    getAll: async () => {
        try {
            const token = await getAuthToken();
            // Using API_BASE_URL to ensure full path if needed, though 'api' instance usually handles baseURL
            // But api.js setup handles baseURL.
            const response = await api.get('/api/admin/templates');
            return response.data;
        } catch (error) {
            console.error('Template fetch error:', error);
            throw error;
        }
    },

    getById: async (id) => {
        try {
            const response = await api.get(`/api/admin/templates/${id}`);
            return response.data;
        } catch (error) {
            console.error('Template detail error:', error);
            throw error;
        }
    }
};

export default templateService;
