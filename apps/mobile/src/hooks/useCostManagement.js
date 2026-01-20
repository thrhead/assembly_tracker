import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import costService from '../services/cost.service';
import jobService from '../services/job.service';
import userService from '../services/user.service';

export const useCostManagement = () => {
    const [costs, setCosts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    // Filter States
    const [selectedJob, setSelectedJob] = useState(null);
    const [selectedUserId, setSelectedUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    // Date Filters (default: last 30 days)
    const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)));
    const [endDate, setEndDate] = useState(new Date());

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [jobsData, costsData, usersData] = await Promise.all([
                jobService.getAll(),
                costService.getAll(),
                userService.getAll()
            ]);
            setJobs(jobsData);
            setCosts(costsData);
            setUsers(usersData);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Hata', 'Veriler yüklenemedi');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const filteredCosts = useMemo(() => {
        let filtered = costs;

        // Job Filter
        if (selectedJob) {
            filtered = filtered.filter(c => c.jobId === selectedJob.id);
        }

        // Category Filter
        if (selectedCategory !== 'ALL') {
            filtered = filtered.filter(c => c.category === selectedCategory);
        }

        // User Filter
        if (selectedUserId) {
            filtered = filtered.filter(c => c.createdById === selectedUserId);
        }

        // Date Filter
        if (startDate && endDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            filtered = filtered.filter(c => {
                const costDate = new Date(c.date);
                return costDate >= start && costDate <= end;
            });
        }

        // Search Filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                (c.description && c.description.toLowerCase().includes(query)) ||
                (c.createdBy?.name && c.createdBy.name.toLowerCase().includes(query))
            );
        }
        return filtered;
    }, [costs, selectedJob, selectedCategory, selectedUserId, startDate, endDate, searchQuery]);

    const budgetStats = useMemo(() => {
        const totalUsed = costs
            .filter(c => c.status === 'APPROVED' && (!selectedJob || c.jobId === selectedJob.id))
            .reduce((sum, c) => sum + parseFloat(c.amount || 0), 0);

        const totalBudget = selectedJob?.budget || 20000;

        return {
            used: totalUsed,
            total: totalBudget,
            remaining: totalBudget - totalUsed
        };
    }, [costs, selectedJob]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    return {
        costs,
        jobs,
        users,
        filteredCosts,
        budgetStats,
        loading,
        refreshing,

        // State & Setters
        selectedJob,
        setSelectedJob,
        selectedUserId,
        setSelectedUserId,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        startDate,
        setStartDate,
        endDate,
        setEndDate,

        onRefresh
    };
};
