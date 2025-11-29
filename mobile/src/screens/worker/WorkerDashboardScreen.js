import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import notificationService from '../../services/notification.service';
import api from '../../services/api';
import NotificationBadge from '../../components/NotificationBadge';

export default function WorkerDashboardScreen({ navigation }) {
    const [stats, setStats] = useState(null);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);
    const { logout } = useAuth();

    useFocusEffect(
        useCallback(() => {
            loadDashboardData();
        }, [])
    );

    const loadDashboardData = async () => {
        try {
            // MOCK DATA - Gerçek API yerine
            const mockStats = {
                total: 12,
                completed: 7,
                inProgress: 3,
                pending: 2,
            };

            const mockRecentJobs = [
                {
                    id: 1,
                    title: 'Klima Montajı - ABC Şirketi',
                    location: 'İstanbul, Kadıköy',
                    status: 'IN_PROGRESS',
                    scheduledDate: '2024-11-24',
                    progress: 66,
                },
                {
                    id: 3,
                    title: 'Bakım - DEF A.Ş.',
                    location: 'İzmir, Konak',
                    status: 'IN_PROGRESS',
                    scheduledDate: '2024-11-23',
                    progress: 66,
                },
                {
                    id: 2,
                    title: 'Silo Kurulumu - XYZ Ltd',
                    location: 'Ankara, Çankaya',
                    status: 'PENDING',
                    scheduledDate: '2024-11-25',
                    progress: 0,
                },
            ];

            setTimeout(() => {
                setStats(mockStats);
                setRecentJobs(mockRecentJobs);
                setLoading(false);
                setRefreshing(false);
            }, 500);

            // Fetch notifications for badge
            // const notifications = await notificationService.getNotifications();
            // const unread = notifications.filter(n => !n.isRead).length;
            // setUnreadCount(unread);
        } catch (error) {
            console.error('Error loading dashboard:', error);
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadDashboardData();
    };

    const handleLogout = async () => {
        await logout();
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

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={['#16A34A']}
                    tintColor="#16A34A"
                />
            }
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Hoş geldiniz! 👋</Text>
                </View>
                <View style={styles.headerButtons}>
                    <NotificationBadge
                        onPress={() => navigation.navigate('Notifications')}
                        color="#000"
                    />
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Profile')}>
                        <Text style={styles.headerButtonIcon}>⚙️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Statistics Cards */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: '#EBF5FF' }]}>
                    <Text style={styles.statNumber}>{stats.total}</Text>
                    <Text style={styles.statLabel}>Toplam İş</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.statNumber, { color: '#059669' }]}>{stats.completed}</Text>
                    <Text style={styles.statLabel}>Tamamlanan</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={[styles.statNumber, { color: '#2563EB' }]}>{stats.inProgress}</Text>
                    <Text style={styles.statLabel}>Devam Eden</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.statNumber, { color: '#D97706' }]}>{stats.pending}</Text>
                    <Text style={styles.statLabel}>Bekleyen</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => navigation.navigate('WorkerJobs')}
                    >
                        <Text style={styles.actionIcon}>📋</Text>
                        <Text style={styles.actionText}>Tüm İşler</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                            // Navigate to first in-progress job
                            const inProgressJob = recentJobs.find(j => j.status === 'IN_PROGRESS');
                            if (inProgressJob) {
                                navigation.navigate('JobDetail', { jobId: inProgressJob.id });
                            }
                        }}
                    >
                        <Text style={styles.actionIcon}>▶️</Text>
                        <Text style={styles.actionText}>Devam Et</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Recent Jobs */}
            <View style={styles.section}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Son İşler</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('WorkerJobs')}>
                        <Text style={styles.seeAllText}>Tümünü Gör →</Text>
                    </TouchableOpacity>
                </View>
                {recentJobs.map((job) => (
                    <TouchableOpacity
                        key={job.id}
                        style={styles.jobCard}
                        onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                    >
                        <View style={styles.jobHeader}>
                            <Text style={styles.jobTitle}>{job.title}</Text>
                            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) }]}>
                                <Text style={styles.statusText}>{getStatusText(job.status)}</Text>
                            </View>
                        </View>
                        <Text style={styles.jobLocation}>📍 {job.location}</Text>
                        <Text style={styles.jobDate}>📅 {formatDate(job.scheduledDate)}</Text>
                        <View style={styles.progressContainer}>
                            <View style={styles.progressBar}>
                                <View style={[styles.progressFill, { width: `${job.progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{job.progress}%</Text>
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#6B7280',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    headerButtons: {
        flexDirection: 'row',
    },
    headerButton: {
        padding: 8,
        marginRight: 8,
        backgroundColor: '#F3F4F6',
        borderRadius: 20,
    },
    headerButtonIcon: {
        fontSize: 24,
    },
    logoutButton: {
        padding: 8,
    },
    logoutIcon: {
        fontSize: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
        gap: 12,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    section: {
        padding: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    seeAllText: {
        fontSize: 14,
        color: '#2563EB',
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
    },
    jobCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    jobHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
        color: '#111827',
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
    },
    jobLocation: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 4,
    },
    jobDate: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 12,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressBar: {
        flex: 1,
        height: 8,
        backgroundColor: '#E5E7EB',
        borderRadius: 4,
        marginRight: 8,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#16A34A',
        borderRadius: 4,
    },
    progressText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#16A34A',
        width: 40,
        textAlign: 'right',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 1,
        borderColor: '#fff',
    },
});
