import { useState, useEffect } from 'react';

export const useJobFiltering = (jobs) => {
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [selectedFilter, setSelectedFilter] = useState('Tümü');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // Debounce search
        const handler = setTimeout(() => {
            filter();
        }, 300);
        return () => clearTimeout(handler);
    }, [searchQuery, jobs, selectedFilter]);

    const filter = () => {
        let result = [...(jobs || [])];

        // Status Filter
        if (selectedFilter === 'Devam Eden') {
            result = result.filter(j => j.status === 'IN_PROGRESS');
        } else if (selectedFilter === 'Bekleyen') {
            result = result.filter(j => j.status === 'PENDING');
        } else if (selectedFilter === 'Onay Bekleyen') {
            result = result.filter(j => j.status === 'PENDING_APPROVAL');
        } else if (selectedFilter === 'Onaylanan') {
            result = result.filter(j => j.status === 'COMPLETED' && j.acceptanceStatus === 'ACCEPTED');
        } else if (selectedFilter === 'Tamamlanan') {
            result = result.filter(j => j.status === 'COMPLETED' || j.status === 'PENDING_APPROVAL');
        }

        // Search Filter
        if (searchQuery) {
            const lower = searchQuery.toLowerCase();
            result = result.filter(j =>
                (j.id && j.id.toLowerCase().includes(lower)) ||
                (j.title && j.title.toLowerCase().includes(lower)) ||
                (j.jobNo && j.jobNo.toLowerCase().includes(lower)) ||
                (j.projectNo && j.projectNo.toLowerCase().includes(lower)) ||
                (j.customer?.company && j.customer.company.toLowerCase().includes(lower))
            );
        }

        // Sort: High priority first, then date
        result.sort((a, b) => {
            const priorityOrder = { URGENT: 3, HIGH: 2, MEDIUM: 1, LOW: 0 };
            const priorityA = priorityOrder[a.priority] || 0;
            const priorityB = priorityOrder[b.priority] || 0;
            const pDiff = priorityB - priorityA;
            if (pDiff !== 0) return pDiff;

            const dateA = a.scheduledDate ? new Date(a.scheduledDate) : new Date(0);
            const dateB = b.scheduledDate ? new Date(b.scheduledDate) : new Date(0);
            return dateA - dateB;
        });

        setFilteredJobs(result);
    };

    return {
        filteredJobs,
        selectedFilter,
        setSelectedFilter,
        searchQuery,
        setSearchQuery
    };
};
