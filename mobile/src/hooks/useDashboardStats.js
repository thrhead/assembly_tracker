import { useState } from 'react';
import api from '../services/api';

export const useDashboardStats = () => {
    const [statsData, setStatsData] = useState({
        totalJobs: 0,
        activeTeams: 0,
        completedJobs: 0,
        pendingJobs: 0
    });
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const [statsRes, jobsRes] = await Promise.all([
                api.get('/api/admin/stats'),
                api.get('/api/admin/jobs')
            ]);
            setStatsData(statsRes.data);

            // Validate jobs data
            if (Array.isArray(jobsRes.data)) {
                setRecentJobs(jobsRes.data.slice(0, 5));
            } else {
                console.error('Invalid jobs data received:', typeof jobsRes.data, jobsRes.data ? jobsRes.data.toString().substring(0, 100) : 'null');
                setRecentJobs([]);
            }
        } catch (error) {
            console.error('Error fetching admin dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    return { statsData, recentJobs, fetchStats, loading };
};
