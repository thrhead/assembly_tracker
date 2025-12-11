import { useState, useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import costService from '../services/cost.service';
import jobService from '../services/job.service';

export const useCostManagement = () => {
    const [costs, setCosts] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [jobsData, costsData] = await Promise.all([
                jobService.getAll(),
                costService.getAll()
            ]);
            setJobs(jobsData);
            setCosts(costsData);
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
        if (selectedJob) {
            filtered = filtered.filter(c => c.jobId === selectedJob.id);
        }
        if (selectedCategory !== 'ALL') {
            filtered = filtered.filter(c => c.category === selectedCategory);
        }
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(c =>
                (c.description && c.description.toLowerCase().includes(query)) ||
                (c.createdBy?.name && c.createdBy.name.toLowerCase().includes(query))
            );
        }
        return filtered;
    }, [costs, selectedJob, selectedCategory, searchQuery]);

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
        filteredCosts,
        budgetStats,
        loading,
        refreshing,
        selectedJob,
        setSelectedJob,
        searchQuery,
        setSearchQuery,
        selectedCategory,
        setSelectedCategory,
        onRefresh
    };
};
