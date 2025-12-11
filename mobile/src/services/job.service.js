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

const request = async (endpoint, options = {}) => {
    try {
        const isFormData = options.body instanceof FormData;
        const headers = await getHeaders(isFormData);

        const config = {
            ...options,
            headers: {
                ...headers,
                ...options.headers
            }
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

        let data;
        try {
            data = await response.json();
        } catch (e) {
            // If response is not JSON (e.g. 204 No Content), data remains undefined
            if (!response.ok) throw new Error('Sunucu hatası');
        }

        if (!response.ok) {
            throw new Error(data?.error || 'İşlem başarısız');
        }

        return data;
    } catch (error) {
        console.error(`Request error [${endpoint}]:`, error);
        throw error;
    }
};

const jobService = {
    // Queries
    getAdminJobs: async () => request('/api/admin/jobs'),

    // Alias for getAdminJobs (Legacy support)
    getAll: async () => jobService.getAdminJobs(),

    getMyJobs: async () => request('/api/worker/jobs'),

    getJobById: async (jobId) => request(`/api/worker/jobs/${jobId}`),

    searchJobs: async (filters = {}) => {
        const params = new URLSearchParams();
        if (filters.search) params.append('search', filters.search);
        if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
        if (filters.priority) params.append('priority', filters.priority);

        return request(`/api/admin/jobs?${params.toString()}`);
    },

    // Alias for searchJobs (Legacy support)
    getAllJobs: async (filters) => jobService.searchJobs(filters),

    getPendingApprovals: async () => request('/api/admin/jobs?status=PENDING_APPROVAL'),

    getTemplates: async () => request('/api/admin/templates'),

    // Mutations - Job Status & Flow
    startJob: async (jobId) => request(`/api/worker/jobs/${jobId}/start`, { method: 'POST' }),

    completeJob: async (jobId) => request(`/api/worker/jobs/${jobId}/complete`, { method: 'POST' }),

    acceptJob: async (jobId) => request(`/api/manager/jobs/${jobId}/accept`, { method: 'POST' }),

    rejectJob: async (jobId, reason) => request(`/api/manager/jobs/${jobId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
    }),

    assignJob: async (jobId, workerId) => request(`/api/admin/jobs/${jobId}/assign`, {
        method: 'POST',
        body: JSON.stringify({ workerId })
    }),

    // Mutations - Steps
    toggleStep: async (jobId, stepId, isCompleted) => request(`/api/worker/jobs/${jobId}/steps/${stepId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ isCompleted })
    }),

    startStep: async (jobId, stepId) => request(`/api/worker/jobs/${jobId}/steps/${stepId}/start`, { method: 'POST' }),

    approveStep: async (stepId) => request(`/api/manager/steps/${stepId}/approve`, { method: 'POST' }),

    rejectStep: async (stepId, reason) => request(`/api/manager/steps/${stepId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
    }),

    // Mutations - Substeps
    toggleSubstep: async (jobId, stepId, substepId, isCompleted) => request(`/api/worker/jobs/${jobId}/steps/${stepId}/substeps/${substepId}/toggle`, {
        method: 'POST',
        body: JSON.stringify({ isCompleted })
    }),

    startSubstep: async (jobId, stepId, substepId) => request(`/api/worker/substeps/${substepId}/start`, { method: 'POST' }),

    approveSubstep: async (substepId) => request(`/api/manager/substeps/${substepId}/approve`, { method: 'POST' }),

    rejectSubstep: async (substepId, reason) => request(`/api/manager/substeps/${substepId}/reject`, {
        method: 'POST',
        body: JSON.stringify({ reason })
    }),

    // Mutations - Photos & Files
    uploadPhotos: async (jobId, stepId, formData, subStepId = null) => {
        if (subStepId) {
            formData.append('subStepId', subStepId);
        }
        return request(`/api/worker/jobs/${jobId}/steps/${stepId}/photos`, {
            method: 'POST',
            body: formData
        });
    },

    bulkImportJobs: async (formData) => request('/api/admin/jobs/bulk-import', {
        method: 'POST',
        body: formData
    }),

    importTemplate: async (formData) => request('/api/admin/templates/import', {
        method: 'POST',
        body: formData
    }),

    // Admin CRUD
    create: async (jobData) => request('/api/admin/jobs', {
        method: 'POST',
        body: JSON.stringify(jobData)
    }),

    update: async (jobId, jobData) => request(`/api/admin/jobs/${jobId}`, {
        method: 'PUT',
        body: JSON.stringify(jobData)
    }),
};

export default jobService;
