import { useState, useCallback } from 'react';
import api from '../services/api';

export const useWebhooks = () => {
    const [webhooks, setWebhooks] = useState([]);
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const loadWebhooks = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/admin/webhooks');
            setWebhooks(res.data);
        } catch (error) {
            console.error('Error loading webhooks:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    const loadLogs = useCallback(async () => {
        try {
            const res = await api.get('/api/admin/webhooks/logs');
            setLogs(res.data);
        } catch (error) {
            console.error('Error loading webhook logs:', error);
        }
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await Promise.all([loadWebhooks(), loadLogs()]);
        setRefreshing(false);
    };

    const toggleWebhook = async (id, isActive) => {
        try {
            await api.patch(`/api/admin/webhooks/${id}`, { isActive });
            await loadWebhooks();
            return true;
        } catch (error) {
            console.error('Error toggling webhook:', error);
            return false;
        }
    };

    return {
        webhooks,
        logs,
        loading,
        refreshing,
        onRefresh,
        loadWebhooks,
        loadLogs,
        toggleWebhook
    };
};
