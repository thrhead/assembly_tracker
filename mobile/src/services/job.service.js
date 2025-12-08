import { API_BASE_URL, getAuthToken } from './api';

const getHeaders = async (isFormData = false) => {
    const token = await getAuthToken();
    console.log('[JobService] Getting headers. Token present:', !!token, token ? token.substring(0, 10) + '...' : 'none');

    const headers = {
        'Accept': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };

    if (!token) {
        console.warn('[JobService] WARNING: No auth token found! Request will likely fail or be slow.');
    }

    if (!isFormData) {
        headers['Content-Type'] = 'application/json';
    }
    return headers;
};

const jobService = {
    getAll: async () => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs`, { headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İşler alınamadı');
            return data;
        } catch (error) {
            console.error('Get all jobs error:', error);
            throw error;
        }
    },

    getMyJobs: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());

            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/worker/jobs?${params.toString()}`, { headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İşlerim alınamadı');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getJobById: async (jobId) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/worker/jobs/${jobId}`, { headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İş detayı alınamadı');
            return data;
        } catch (error) {
            throw error;
        }
    },

    toggleStep: async (jobId, stepId, isCompleted) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/worker/jobs/${jobId}/steps/${stepId}/toggle`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ isCompleted })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İşlem başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    },

    toggleSubstep: async (jobId, stepId, substepId, isCompleted) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/worker/jobs/${jobId}/steps/${stepId}/substeps/${substepId}/toggle`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ isCompleted })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İşlem başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    },

    uploadPhotos: async (jobId, stepId, formData, subStepId = null) => {
        try {
            if (subStepId) {
                formData.append('subStepId', subStepId);
            }
            const headers = await getHeaders(true); // True for FormData
            const response = await fetch(`${API_BASE_URL}/api/worker/jobs/${jobId}/steps/${stepId}/photos`, {
                method: 'POST',
                headers, // No Content-Type
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Fotoğraf yüklenemedi');
            return data;
        } catch (error) {
            throw error;
        }
    },

    completeJob: async (jobId) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/worker/jobs/${jobId}/complete`, {
                method: 'POST',
                headers
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İş tamamlanamadı');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getAllJobs: async (filters = {}) => {
        try {
            const params = new URLSearchParams();
            if (filters.search) params.append('search', filters.search);
            if (filters.status && filters.status !== 'ALL') params.append('status', filters.status);
            if (filters.priority) params.append('priority', filters.priority);
            if (filters.page) params.append('page', filters.page.toString());
            if (filters.limit) params.append('limit', filters.limit.toString());

            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs?${params.toString()}`, { headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İşler alınamadı');
            return data;
        } catch (error) {
            throw error;
        }
    },

    assignJob: async (jobId, workerId) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}/assign`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ workerId })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Atama başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    },

    approveStep: async (stepId) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/manager/steps/${stepId}/approve`, {
                method: 'POST',
                headers
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Onaylama başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    },

    rejectStep: async (stepId, reason) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/manager/steps/${stepId}/reject`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ reason })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Reddetme başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    },

    approveSubstep: async (substepId) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/manager/substeps/${substepId}/approve`, {
                method: 'POST',
                headers
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Onaylama başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    },

    rejectSubstep: async (substepId, reason) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/manager/substeps/${substepId}/reject`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ reason })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Reddetme başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    },

    acceptJob: async (jobId) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/manager/jobs/${jobId}/accept`, {
                method: 'POST',
                headers
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İş kabul edilemedi');
            return data;
        } catch (error) {
            throw error;
        }
    },

    rejectJob: async (jobId, reason) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/manager/jobs/${jobId}/reject`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ reason })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İş reddedilemedi');
            return data;
        } catch (error) {
            throw error;
        }
    },

    create: async (jobData) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs`, {
                method: 'POST',
                headers,
                body: JSON.stringify(jobData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İş oluşturulamadı');
            return data;
        } catch (error) {
            throw error;
        }
    },

    update: async (jobId, jobData) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs/${jobId}`, {
                method: 'PUT',
                headers,
                body: JSON.stringify(jobData)
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Güncelleme başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getPendingApprovals: async () => {
        try {
            // This endpoint needs to exist on backend, or we filter getAllJobs
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs?status=PENDING_APPROVAL`, { headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Onay bekleyen işler alınamadı');
            return data;
        } catch (error) {
            throw error;
        }
    },

    startJob: async (jobId) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/worker/jobs/${jobId}/start`, {
                method: 'POST',
                headers
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'İş başlatılamadı');
            return data;
        } catch (error) {
            throw error;
        }
    },

    startStep: async (jobId, stepId) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/worker/jobs/${jobId}/steps/${stepId}/start`, {
                method: 'POST',
                headers
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Adım başlatılamadı');
            return data;
        } catch (error) {
            throw error;
        }
    },

    startSubstep: async (jobId, stepId, substepId) => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/worker/substeps/${substepId}/start`, {
                method: 'POST',
                headers
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Alt adım başlatılamadı');
            return data;
        } catch (error) {
            throw error;
        }
    },

    getTemplates: async () => {
        try {
            const headers = await getHeaders();
            const response = await fetch(`${API_BASE_URL}/api/admin/templates`, { headers });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Şablonlar alınamadı');
            return data;
        } catch (error) {
            console.error('Get templates error:', error);
            throw error;
        }
    },

    bulkImportJobs: async (formData) => {
        try {
            const headers = await getHeaders(true); // Is FormData
            const response = await fetch(`${API_BASE_URL}/api/admin/jobs/bulk-import`, {
                method: 'POST',
                headers,
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Toplu iş yükleme başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    },

    importTemplate: async (formData) => {
        try {
            const headers = await getHeaders(true); // Is FormData
            const response = await fetch(`${API_BASE_URL}/api/admin/templates/import`, {
                method: 'POST',
                headers,
                body: formData
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Şablon yükleme başarısız');
            return data;
        } catch (error) {
            throw error;
        }
    }
};

export default jobService;
