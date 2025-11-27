import api from './api';

const jobService = {
    /**
     * Get all jobs assigned to the current worker
     * @returns {Promise<{jobs}>}
     */
    getMyJobs: async () => {
        try {
            const response = await api.get('/api/worker/jobs');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get job details by ID
     * @param {string} jobId
     * @returns {Promise<{job}>}
     */
    getJobById: async (jobId) => {
        try {
            const response = await api.get(`/api/worker/jobs/${jobId}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Toggle job step completion
     * @param {string} jobId
     * @param {string} stepId
     * @param {boolean} isCompleted
     * @returns {Promise<{success}>}
     */
    toggleStep: async (jobId, stepId, isCompleted) => {
        try {
            const response = await api.post(
                `/api/worker/jobs/${jobId}/steps/${stepId}/toggle`,
                { isCompleted }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Toggle substep completion
     * @param {string} jobId
     * @param {string} stepId
     * @param {string} substepId
     * @param {boolean} isCompleted
     * @returns {Promise<{success}>}
     */
    toggleSubstep: async (jobId, stepId, substepId, isCompleted) => {
        try {
            const response = await api.post(
                `/api/worker/jobs/${jobId}/steps/${stepId}/substeps/${substepId}/toggle`,
                { isCompleted }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Upload photos for a job step
     * @param {string} jobId
     * @param{string} stepId
     * @param {FormData} formData
     * @returns {Promise<{photos}>}
     */
    uploadPhotos: async (jobId, stepId, formData, subStepId = null) => {
        try {
            if (subStepId) {
                formData.append('subStepId', subStepId);
            }
            const response = await api.post(
                `/api/worker/jobs/${jobId}/steps/${stepId}/photos`,
                formData,
                {
                    transformRequest: (data, headers) => {
                        // Do not stringify FormData
                        return data;
                    },
                }
            );
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Complete a job
     * @param {string} jobId
     * @returns {Promise<{success}>}
     */
    completeJob: async (jobId) => {
        try {
            const response = await api.put(`/api/worker/jobs/${jobId}/complete`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Get all jobs (Manager/Admin)
     * @param {Object} filters
     * @returns {Promise<Array>}
     */
    getAllJobs: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);

            const response = await api.get(`/api/admin/jobs?${params.toString()}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    /**
     * Assign job to worker
     * @param {string} jobId
     * @param {string} workerId
     * @returns {Promise<Object>}
     */
    assignJob: async (jobId, workerId) => {
        try {
            const response = await api.post(`/api/admin/jobs/${jobId}/assign`, { workerId });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    approveStep: async (stepId) => {
        try {
            const response = await api.post(`/api/manager/steps/${stepId}/approve`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    rejectStep: async (stepId, reason) => {
        try {
            const response = await api.post(`/api/manager/steps/${stepId}/reject`, { reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    approveSubstep: async (substepId) => {
        try {
            const response = await api.post(`/api/manager/substeps/${substepId}/approve`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    rejectSubstep: async (substepId, reason) => {
        try {
            const response = await api.post(`/api/manager/substeps/${substepId}/reject`, { reason });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    acceptJob: async (jobId) => {
        try {
            const response = await api.post(`/api/manager/jobs/${jobId}/accept`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },
};

export default jobService;
