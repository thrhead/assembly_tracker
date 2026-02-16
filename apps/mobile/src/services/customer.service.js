import api from './api';

const customerService = {
    /**
     * Get all customers (Admin only)
     * @param {string} search - Optional search query
     * @returns {Promise<Array>}
     */
    getAll: async (search = '') => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const response = await api.get(`/api/admin/customers?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Create a new customer
     * @param {Object} customerData
     * @returns {Promise<Object>}
     */
    create: async (customerData) => {
        try {
            const response = await api.post('/api/admin/customers', customerData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update an existing customer
     * @param {string} id
     * @param {Object} customerData
     * @returns {Promise<Object>}
     */
    update: async (id, customerData) => {
        try {
            const response = await api.put(`/api/admin/customers/${id}`, customerData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Delete a customer
     * @param {string} id
     * @returns {Promise<Object>}
     */
    delete: async (id) => {
        try {
            const response = await api.delete(`/api/admin/customers/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default customerService;
