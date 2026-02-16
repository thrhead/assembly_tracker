import { useState, useEffect } from 'react';
import jobService from '../services/job.service';
import costService from '../services/cost.service';
import { useAlert } from '../context/AlertContext';

export const useApprovals = () => {
    const { showAlert } = useAlert();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [approvals, setApprovals] = useState([]);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        loadApprovals();
    }, []);

    const loadApprovals = async () => {
        try {
            setLoading(true);
            const pendingCosts = await costService.getAll({ status: 'PENDING' });
            const pendingJobs = await jobService.getAllJobs({ status: 'PENDING' });
            // Using existing logic to format...
            const formattedCosts = pendingCosts.map(c => ({
                id: c.id,
                type: 'COST',
                title: `${c.amount} ${c.currency} - ${c.category}`,
                requester: c.createdBy?.name || 'Bilinmiyor',
                date: new Date(c.date).toLocaleDateString(),
                status: c.status,
                raw: c
            }));

            const formattedJobs = pendingJobs.map(j => ({
                id: j.id,
                type: 'JOB',
                title: j.title,
                requester: j.assignee?.name || 'Atanmamış',
                date: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'Tarih Yok',
                status: j.status,
                raw: j
            }));

            setApprovals([...formattedJobs, ...formattedCosts]);
        } catch (error) {
            console.error('Error loading approvals:', error);
            showAlert('Hata', 'Onay listesi yüklenemedi.', [], 'error');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadApprovals();
    };

    const handleApprove = async (item) => {
        try {
            if (item.type === 'COST') {
                await costService.updateStatus(item.id, 'APPROVED');
            } else if (item.type === 'JOB') {
                await jobService.acceptJob(item.id);
            }
            showAlert('Başarılı', 'Onaylandı.', [], 'success');
            loadApprovals();
        } catch (error) {
            console.error('Approve error:', error);
            showAlert('Hata', 'İşlem başarısız.', [], 'error');
        }
    };

    const handleReject = async (item) => {
        try {
            if (item.type === 'COST') {
                await costService.updateStatus(item.id, 'REJECTED', 'Yönetici tarafından reddedildi.');
            } else if (item.type === 'JOB') {
                showAlert('Bilgi', 'İş reddetme henüz aktif değil.', [], 'info');
                return;
            }
            showAlert('Başarılı', 'Reddedildi.', [], 'success');
            loadApprovals();
        } catch (error) {
            console.error('Reject error:', error);
            showAlert('Hata', 'İşlem başarısız.', [], 'error');
        }
    };

    const filteredApprovals = approvals.filter(item => filter === 'ALL' || item.type === filter);

    return {
        approvals,
        filteredApprovals,
        filter,
        setFilter,
        loading,
        refreshing,
        onRefresh,
        handleApprove,
        handleReject
    };
};
