import api from './api';

const costService = {
    /**
     * Create a new cost entry
     * @param {Object} costData
     * @returns {Promise<Object>}
     */
    create: async (costData) => {
        try {
            const response = await api.post('/api/worker/costs', costData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get worker's costs
     * @returns {Promise<Array>}
     */
    getMyCosts: async () => {
        try {
            const response = await api.get('/api/worker/costs');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all costs (Manager/Admin)
     * @param {Object} filters
     * @returns {Promise<Array>}
     */
    getAll: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.jobId) params.append('jobId', filters.jobId);

            const response = await api.get(`/api/admin/costs?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Update cost status (Approve/Reject)
     * @param {string} id
     * @param {string} status 'APPROVED' | 'REJECTED'
     * @param {string} rejectionReason
     * @returns {Promise<Object>}
     */
    updateStatus: async (id, status, rejectionReason) => {
        try {
            const response = await api.patch(`/api/admin/costs/${id}`, {
                status,
                rejectionReason
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};

export default costService;
