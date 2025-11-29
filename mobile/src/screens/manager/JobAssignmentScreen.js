import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput, RefreshControl, Modal, Alert } from 'react-native';
import jobService from '../../services/job.service';
import teamService from '../../services/team.service';
import { useAuth } from '../../context/AuthContext';

export default function JobAssignmentScreen({ navigation }) {
    const { user } = useAuth();
    const [jobs, setJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedFilter, setSelectedFilter] = useState('ALL');
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [selectedJob, setSelectedJob] = useState(null);
    const [workers, setWorkers] = useState([]);

    const statusFilters = [
        { key: 'ALL', label: 'Tümü' },
        { key: 'PENDING', label: 'Bekliyor' },
        { key: 'IN_PROGRESS', label: 'Devam Ediyor' },
        { key: 'COMPLETED', label: 'Tamamlandı' },
    ];

    useEffect(() => {
        loadJobs();
        loadWorkers();
    }, []);

    useEffect(() => {
        filterJobs();
    }, [searchQuery, selectedFilter, jobs]);

    const loadJobs = async () => {
        try {
            const data = await jobService.getAllJobs();
            setJobs(data);
            setLoading(false);
            setRefreshing(false);
        } catch (error) {
            console.error('Error loading jobs:', error);
            Alert.alert('Hata', 'İşler yüklenemedi.');
            setLoading(false);
            setRefreshing(false);
        }
    };

    const loadWorkers = async () => {
        try {
            const teams = await teamService.getAll();
            // Get all members from all teams (or filter by manager's team)
            // For now, we collect all members from all teams accessible to the manager
            let allMembers = [];
            teams.forEach(team => {
                if (team.members) {
                    allMembers = [...allMembers, ...team.members];
                }
            });

            // Remove duplicates if any (though userId should be unique in team_members usually)
            // But a user can be in multiple teams? Schema says @@unique([teamId, userId]).
            // So same user can be in multiple teams.
            // We want unique users.
            const uniqueWorkers = Array.from(new Map(allMembers.map(m => [m.userId, m])).values());

            setWorkers(uniqueWorkers);
        } catch (error) {
            console.error('Error loading workers:', error);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadJobs();
    };

    const filterJobs = () => {
        let filtered = jobs;

        // Status filter
        if (selectedFilter !== 'ALL') {
            filtered = filtered.filter(job => job.status === selectedFilter);
        }

        // Search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(query) ||
                (job.customer?.company || '').toLowerCase().includes(query) ||
                (job.location || '').toLowerCase().includes(query)
            );
        }

        setFilteredJobs(filtered);
    };

    const handleAssignJob = (job) => {
        setSelectedJob(job);
        setAssignModalVisible(true);
    };

    const assignWorkerToJob = async (workerId) => {
        try {
            await jobService.assignJob(selectedJob.id, workerId);
            Alert.alert('Başarılı', 'İş başarıyla atandı.');
            setAssignModalVisible(false);
            loadJobs(); // Reload to update list
        } catch (error) {
            console.error('Assign job error:', error);
            Alert.alert('Hata', 'İş atanamadı.');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'PENDING': return '#F59E0B';
            case 'IN_PROGRESS': return '#3B82F6';
            case 'COMPLETED': return '#10B981';
            default: return '#6B7280';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'PENDING': return 'Bekliyor';
            case 'IN_PROGRESS': return 'Devam Ediyor';
            case 'COMPLETED': return 'Tamamlandı';
            default: return status;
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return '#EF4444';
            case 'medium': return '#F59E0B';
            case 'low': return '#10B981';
            case 'urgent': return '#DC2626';
            default: return '#6B7280';
        }
    };

    const getPriorityText = (priority) => {
        switch (priority?.toLowerCase()) {
            case 'high': return 'Yüksek';
            case 'medium': return 'Orta';
            case 'low': return 'Düşük';
            case 'urgent': return 'Acil';
            default: return priority;
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    const renderJob = ({ item }) => {
        const assignedWorker = item.assignments?.[0]?.worker?.name;
        const customerName = item.customer?.company || item.customer?.user?.name || 'Müşteri';

        return (
            <View style={styles.jobCard}>
                <View style={styles.jobHeader}>
                    <View style={styles.jobTitleRow}>
                        <Text style={styles.jobTitle}>{item.title}</Text>
                        <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(item.priority) }]}>
                            <Text style={styles.priorityText}>⚡ {getPriorityText(item.priority)}</Text>
                        </View>
                    </View>
                    <Text style={styles.jobCustomer}>🏢 {customerName}</Text>
                    <Text style={styles.jobLocation}>📍 {item.location || 'Konum belirtilmemiş'}</Text>
                    <Text style={styles.jobDate}>📅 {formatDate(item.scheduledDate)}</Text>
                </View>

                <View style={styles.jobFooter}>
                    <View style={styles.assignmentInfo}>
                        {assignedWorker ? (
                            <>
                                <Text style={styles.assignedLabel}>Atanan:</Text>
                                <Text style={styles.assignedWorker}>{assignedWorker}</Text>
                            </>
                        ) : (
                            <Text style={styles.unassignedText}>Atanmamış</Text>
                        )}
                    </View>
                    <View style={styles.jobActions}>
                        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
                        </View>
                        {item.status !== 'COMPLETED' && (
                            <TouchableOpacity
                                style={styles.assignButton}
                                onPress={() => handleAssignJob(item)}
                            >
                                <Text style={styles.assignButtonText}>
                                    {assignedWorker ? 'Yeniden Ata' : 'Ata'}
                                </Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📋</Text>
            <Text style={styles.emptyTitle}>İş bulunamadı</Text>
            <Text style={styles.emptyText}>
                {searchQuery ? 'Arama kriterlerinize uygun iş bulunamadı.' : 'Henüz iş eklenmemiş.'}
            </Text>
        </View>
    );

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#F59E0B" />
                <Text style={styles.loadingText}>İşler yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                {/* Search Bar */}
                <View style={styles.searchContainer}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="İş ara..."
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Text style={styles.clearIcon}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Status Filter Tabs */}
                <View style={styles.filtersContainer}>
                    {statusFilters.map((filter) => (
                        <TouchableOpacity
                            key={filter.key}
                            style={[
                                styles.filterChip,
                                selectedFilter === filter.key && styles.filterChipActive
                            ]}
                            onPress={() => setSelectedFilter(filter.key)}
                        >
                            <Text style={[
                                styles.filterChipText,
                                selectedFilter === filter.key && styles.filterChipTextActive
                            ]}>
                                {filter.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            <FlatList
                data={filteredJobs}
                renderItem={renderJob}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={styles.listContainer}
                ListEmptyComponent={renderEmptyState}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        colors={['#F59E0B']}
                        tintColor="#F59E0B"
                    />
                }
            />

            {/* Worker Assignment Modal */}
            <Modal
                visible={assignModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setAssignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Worker Seç</Text>
                        <Text style={styles.modalSubtitle}>
                            {selectedJob?.title}
                        </Text>

                        <FlatList
                            data={workers.filter(w => w.user.isActive)}
                            keyExtractor={item => item.id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.workerOption}
                                    onPress={() => assignWorkerToJob(item.user.id)}
                                >
                                    <Text style={styles.workerName}>{item.user.name}</Text>
                                    <Text style={styles.workerStatus}>
                                        {item.user.isActive ? '✓ Aktif' : 'Pasif'}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />

                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setAssignModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>İptal</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#010100',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#94a3b8',
    },
    headerContainer: {
        backgroundColor: '#1A1A1A',
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2d3748',
        marginHorizontal: 16,
        marginTop: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    searchIcon: {
        fontSize: 16,
        marginRight: 8,
        color: '#94a3b8',
    },
    searchInput: {
        flex: 1,
        fontSize: 14,
        color: '#ffffff',
    },
    clearIcon: {
        fontSize: 18,
        color: '#94a3b8',
        padding: 4,
    },
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: '#2d3748',
    },
    filterChipActive: {
        backgroundColor: '#F59E0B',
    },
    filterChipText: {
        fontSize: 14,
        color: '#94a3b8',
        fontWeight: '500',
    },
    filterChipTextActive: {
        color: '#fff',
    },
    listContainer: {
        padding: 16,
    },
    jobCard: {
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333',
    },
    jobHeader: {
        marginBottom: 12,
    },
    jobTitleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#ffffff',
        flex: 1,
        marginRight: 8,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    priorityText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    jobCustomer: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 4,
    },
    jobLocation: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 4,
    },
    jobDate: {
        fontSize: 14,
        color: '#94a3b8',
    },
    jobFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#333',
        paddingTop: 12,
    },
    assignmentInfo: {
        flex: 1,
    },
    assignedLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 2,
    },
    assignedWorker: {
        fontSize: 14,
        fontWeight: '600',
        color: '#ffffff',
    },
    unassignedText: {
        fontSize: 14,
        color: '#EF4444',
        fontWeight: '600',
    },
    jobActions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 8,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    assignButton: {
        backgroundColor: '#F59E0B',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
    },
    assignButtonText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        paddingHorizontal: 32,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: '#1A1A1A',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
        maxHeight: '70%',
        borderWidth: 1,
        borderColor: '#333',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 8,
    },
    modalSubtitle: {
        fontSize: 14,
        color: '#94a3b8',
        marginBottom: 20,
    },
    workerOption: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        backgroundColor: '#2d3748',
        borderRadius: 8,
        marginBottom: 8,
    },
    workerName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#ffffff',
    },
    workerStatus: {
        fontSize: 14,
        color: '#4ade80',
    },
    cancelButton: {
        backgroundColor: '#334155',
        padding: 16,
        borderRadius: 8,
        marginTop: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e2e8f0',
    },
});
