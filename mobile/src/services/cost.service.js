import { API_BASE_URL, getAuthToken } from './api';

const getHeaders = async (isFormData = false) => {
    const token = await getAuthToken();
    const headers = {
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

const costService = {
    /**
     * Create a new cost entry
     * @param {Object|FormData} costData
     * @returns {Promise<Object>}
     */
    create: async (costData) => {
        try {
            const isFormData = costData instanceof FormData;
            const headers = await getHeaders(isFormData);

            const response = await fetch(`${API_BASE_URL}/api/worker/costs`, {
                method: 'POST',
                headers,
                body: isFormData ? costData : JSON.stringify(costData)
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Masraf eklenemedi');
            }
            return data;
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
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/worker/costs`, {
                method: 'GET',
                headers
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Masraflar alınamadı');
            }
            return data;
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

            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/costs?${params.toString()}`, {
                method: 'GET',
                headers
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Masraflar alınamadı');
            }
            return data;
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
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/costs/${id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ status, rejectionReason })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Durum güncellenemedi');
            }
            return data;
        } catch (error) {
            throw error;
        }
    }
};

export default costService;
