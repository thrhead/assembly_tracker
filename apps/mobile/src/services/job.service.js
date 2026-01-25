import api from './api';

const jobService = {
    // Queries
    getAdminJobs: async () => {
        const response = await api.get('/api/admin/jobs');
        return response.data;
    },

    // Alias for getAdminJobs (Legacy support)
    getAll: async () => jobService.getAdminJobs(),

    getMyJobs: async () => {
        const response = await api.get('/api/worker/jobs');
        return response.data;
    },

    getJobById: async (jobId) => {
        const response = await api.get(`/api/worker/jobs/${jobId}`);
        return response.data;
    },

    searchJobs: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);

        const response = await api.get(`/api/admin/jobs?${params.toString()}`);
        return response.data;
    },

    // Alias for searchJobs (Legacy support)
    getAllJobs: async (filters) => jobService.searchJobs(filters),

    getPendingApprovals: async () => {
        const response = await api.get('/api/admin/jobs?status=PENDING_APPROVAL');
        return response.data;
    },

    getTemplates: async () => {
        const response = await api.get('/api/admin/templates');
        return response.data;
    },

    // Mutations - Job Status & Flow
    startJob: async (jobId) => {
        const response = await api.post(`/api/worker/jobs/${jobId}/start`);
        return response.data;
    },

    completeJob: async (jobId, signature, coords) => {
        const response = await api.post(`/api/worker/jobs/${jobId}/complete`, {
            signature,
            signatureLatitude: coords?.latitude,
            signatureLongitude: coords?.longitude
        });
        return response.data;
    },

    acceptJob: async (jobId) => {
        const response = await api.post(`/api/manager/jobs/${jobId}/accept`);
        return response.data;
    },

    rejectJob: async (jobId, reason) => {
        const response = await api.post(`/api/manager/jobs/${jobId}/reject`, { reason });
        return response.data;
    },

    assignJob: async (jobId, workerId) => {
        const response = await api.post(`/api/admin/jobs/${jobId}/assign`, { workerId });
        return response.data;
    },

    // Mutations - Steps
    toggleStep: async (jobId, stepId, isCompleted) => {
        const response = await api.post(`/api/worker/jobs/${jobId}/steps/${stepId}/toggle`, { isCompleted });
        return response.data;
    },

    startStep: async (jobId, stepId) => {
        const response = await api.post(`/api/worker/jobs/${jobId}/steps/${stepId}/start`);
        return response.data;
    },

    approveStep: async (stepId) => {
        const response = await api.post(`/api/manager/steps/${stepId}/approve`);
        return response.data;
    },

    rejectStep: async (stepId, reason) => {
        const response = await api.post(`/api/manager/steps/${stepId}/reject`, { reason });
        return response.data;
    },

    // Mutations - Substeps
    toggleSubstep: async (jobId, stepId, substepId, isCompleted) => {
        const response = await api.post(`/api/worker/jobs/${jobId}/steps/${stepId}/substeps/${substepId}/toggle`, { isCompleted });
        return response.data;
    },

    startSubstep: async (jobId, stepId, substepId) => {
        const response = await api.post(`/api/worker/substeps/${substepId}/start`);
        return response.data;
    },

    approveSubstep: async (substepId) => {
        const response = await api.post(`/api/manager/substeps/${substepId}/approve`);
        return response.data;
    },

    rejectSubstep: async (substepId, reason) => {
        const response = await api.post(`/api/manager/substeps/${substepId}/reject`, { reason });
        return response.data;
    },

    // Mutations - Photos & Files
    uploadPhotos: async (jobId, stepId, formData, subStepId = null, base64 = null) => {
        if (base64) {
            // JSON/Base64 Upload Strategy (Robust)
            const payload = {
                photo: base64,
                subStepId: subStepId || null
            };
            const response = await api.post(`/api/worker/jobs/${jobId}/steps/${stepId}/photos`, payload, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        }

        // Fallback or legacy way (FormData)
        if (subStepId) {
            formData.append('subStepId', subStepId);
        }
        const response = await api.post(`/api/worker/jobs/${jobId}/steps/${stepId}/photos`, formData, {
            headers: {
                'Accept': 'application/json',
                // 'Content-Type': 'multipart/form-data', // Let Axios set this with boundary
            },
            transformRequest: (data, headers) => {
                return data; // React Native FormData should not be transformed
            },
        });
        return response.data;
    },

    deletePhoto: async (jobId, stepId, photoId) => {
        const response = await api.delete(`/api/worker/jobs/${jobId}/steps/${stepId}/photos/${photoId}`);
        return response.data;
    },

    uploadAudio: async (jobId, stepId, formData, subStepId = null) => {
        if (subStepId) {
            formData.append('subStepId', subStepId);
        }
        const response = await api.post(`/api/worker/jobs/${jobId}/steps/${stepId}/audio`, formData, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'multipart/form-data',
            },
            transformRequest: (data, headers) => {
                return data;
            },
        });
        return response.data;
    },

    bulkImportJobs: async (formData) => {
        const response = await api.post('/api/admin/jobs/bulk-import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    importTemplate: async (formData) => {
        const response = await api.post('/api/admin/templates/import', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    // Admin CRUD
    create: async (jobData) => {
        const response = await api.post('/api/admin/jobs', jobData);
        return response.data;
    },

    update: async (jobId, jobData) => {
        const response = await api.put(`/api/admin/jobs/${jobId}`, jobData);
        return response.data;
    },
};

export default jobService;
