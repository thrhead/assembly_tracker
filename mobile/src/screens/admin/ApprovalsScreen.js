import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/job.service';
import costService from '../../services/cost.service';

export default function ApprovalsScreen({ navigation }) {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [approvals, setApprovals] = useState([]);
    const [filter, setFilter] = useState('ALL'); // ALL, JOBS, COSTS

    const loadApprovals = async () => {
        try {
            setLoading(true);

            // Fetch pending costs
            const pendingCosts = await costService.getAll({ status: 'PENDING' });

            // Fetch pending jobs (or steps/substeps needing approval)
            // Since we don't have a direct 'getPendingApprovals' for jobs in the service yet that returns a unified list,
            // we might need to fetch jobs and filter, or assume the backend provides a specific endpoint.
            // For now, let's assume we fetch pending jobs.
            const pendingJobs = await jobService.getAllJobs({ status: 'PENDING' }); // Or PENDING_APPROVAL if that status exists

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
                requester: j.assignee?.name || 'Atanmamış', // Or creator
                date: j.createdAt ? new Date(j.createdAt).toLocaleDateString() : 'Tarih Yok',
                status: j.status,
                raw: j
            }));

            setApprovals([...formattedJobs, ...formattedCosts]);

        } catch (error) {
            console.error('Error loading approvals:', error);
            Alert.alert('Hata', 'Onay listesi yüklenemedi.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadApprovals();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        loadApprovals();
    };

    const handleApprove = async (item) => {
        try {
            if (item.type === 'COST') {
                await costService.updateStatus(item.id, 'APPROVED');
            } else if (item.type === 'JOB') {
                // For jobs, maybe we are approving the job itself or a step?
                // Assuming job approval (e.g. moving from Pending to In Progress or verifying completion)
                // For now, let's assume we are accepting the job or approving it.
                // If it's a job, maybe we use acceptJob?
                await jobService.acceptJob(item.id);
            }
            Alert.alert('Başarılı', 'Onaylandı.');
            loadApprovals();
        } catch (error) {
            console.error('Approve error:', error);
            Alert.alert('Hata', 'İşlem başarısız.');
        }
    };

    const handleReject = async (item) => {
        try {
            if (item.type === 'COST') {
                await costService.updateStatus(item.id, 'REJECTED', 'Yönetici tarafından reddedildi.');
            } else if (item.type === 'JOB') {
                // Reject job?
                Alert.alert('Bilgi', 'İş reddetme henüz aktif değil.');
                return;
            }
            Alert.alert('Başarılı', 'Reddedildi.');
            loadApprovals();
        } catch (error) {
            console.error('Reject error:', error);
            Alert.alert('Hata', 'İşlem başarısız.');
        }
    };

    const renderApprovalItem = ({ item }) => (
        <TouchableOpacity style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'JOB' ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 165, 0, 0.1)' }]}>
                    <MaterialIcons
                        name={item.type === 'JOB' ? 'work' : 'receipt'}
                        size={16}
                        color={item.type === 'JOB' ? '#CCFF04' : '#FFA500'}
                    />
                    <Text style={[styles.typeText, { color: item.type === 'JOB' ? '#CCFF04' : '#FFA500' }]}>
                        {item.type === 'JOB' ? 'İŞ ONAYI' : 'MASRAF ONAYI'}
                    </Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.requester}>Talep Eden: {item.requester}</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleReject(item)}
                >
                    <MaterialIcons name="close" size={20} color="#ff4444" />
                    <Text style={styles.rejectText}>Reddet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleApprove(item)}
                >
                    <MaterialIcons name="check" size={20} color="#000000" />
                    <Text style={styles.approveText}>Onayla</Text>
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'ALL' && styles.activeFilter]}
                    onPress={() => setFilter('ALL')}
                >
                    <Text style={[styles.filterText, filter === 'ALL' && styles.activeFilterText]}>Tümü</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'JOB' && styles.activeFilter]}
                    onPress={() => setFilter('JOB')}
                >
                    <Text style={[styles.filterText, filter === 'JOB' && styles.activeFilterText]}>İşler</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'COST' && styles.activeFilter]}
                    onPress={() => setFilter('COST')}
                >
                    <Text style={[styles.filterText, filter === 'COST' && styles.activeFilterText]}>Masraflar</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#CCFF04" style={styles.loader} />
            ) : (
                <FlatList
                    data={approvals.filter(item => filter === 'ALL' || item.type === filter)}
                    renderItem={renderApprovalItem}
                    keyExtractor={item => `${item.type}-${item.id}`}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#CCFF04" />
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <MaterialIcons name="check-circle" size={64} color="#333" />
                            <Text style={styles.emptyText}>Bekleyen onay bulunmuyor</Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#010100',
    },
    filterContainer: {
        flexDirection: 'row',
        padding: 16,
        gap: 12,
    },
    filterButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        backgroundColor: '#1A1A1A',
        borderWidth: 1,
        borderColor: '#333',
    },
    activeFilter: {
        backgroundColor: '#CCFF04',
        borderColor: '#CCFF04',
    },
    filterText: {
        color: '#888',
        fontWeight: '500',
    },
    activeFilterText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    loader: {
        marginTop: 40,
    },
    listContent: {
        padding: 16,
        paddingTop: 0,
    },
    card: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
    },
    typeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        color: '#666',
        fontSize: 12,
    },
    title: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    requester: {
        color: '#888',
        fontSize: 14,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    rejectButton: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    approveButton: {
        backgroundColor: '#CCFF04',
    },
    rejectText: {
        color: '#ff4444',
        fontWeight: '600',
    },
    approveText: {
        color: '#000000',
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
        gap: 16,
    },
    emptyText: {
        color: '#666',
        fontSize: 16,
    },
});
