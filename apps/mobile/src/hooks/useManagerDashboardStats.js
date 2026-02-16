import { useState } from 'react';
import api from '../services/api';

export const useManagerDashboardStats = () => {
    const [statsData, setStatsData] = useState({
        totalJobs: 0,
        activeTeams: 0,
        completedJobsThisMonth: 0,
        pendingApprovals: 0,
        recentJobs: [],
        efficiencyScore: 0
    });
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/api/manager/stats');
            setStatsData(res.data);
        } catch (error) {
            console.error('Error fetching manager dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return { statsData, fetchStats, loading };
};
