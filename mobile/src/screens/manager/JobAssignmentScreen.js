import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import jobService from '../../services/job.service';
import teamService from '../../services/team.service';
import customerService from '../../services/customer.service';
import StatCard from '../../components/StatCard';
import CustomButton from '../../components/CustomButton';
import { COLORS } from '../../constants/theme';

export default function JobAssignmentScreen({ navigation }) {
    const [jobs, setJobs] = useState([]);
    const [teams, setTeams] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const [jobsData, teamsData, customersData] = await Promise.all([
                jobService.getAll(),
                teamService.getAll(),
                customerService.getAll()
            ]);

            setJobs(jobsData);
            setTeams(teamsData);
            setCustomers(customersData);
        } catch (error) {
            console.error('Error loading data:', error);
            Alert.alert('Hata', 'Veriler yüklenemedi');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const getStats = () => {
        const total = jobs.length;
        const active = jobs.filter(j => j.status === 'IN_PROGRESS').length;
        const completed = jobs.filter(j => j.status === 'COMPLETED').length;
        const pending = jobs.filter(j => j.status === 'PENDING').length;

        const totalRevenue = jobs
            .filter(j => j.status === 'COMPLETED')
            .reduce((sum, j) => sum + (j.price || 0), 0);

        return { total, active, completed, pending, totalRevenue };
    };

    const getStatusColor = (status) => {
        const colors = {
            'PENDING': COLORS.amber500,
            'IN_PROGRESS': COLORS.blue500,
            'COMPLETED': COLORS.green500,
            'ON_HOLD': COLORS.slate600,
            'CANCELLED': COLORS.red500
        };
        return colors[status] || COLORS.slate600;
    };

    const getStatusLabel = (status) => {
        const labels = {
            'PENDING': 'Beklemede',
            'IN_PROGRESS': 'Devam Ediyor',
            'COMPLETED': 'Tamamlandı',
            'ON_HOLD': 'Askıda',
            'CANCELLED': 'İptal'
        };
        return labels[status] || status;
    };

    const getPriorityColor = (priority) => {
        const colors = {
            'URGENT': COLORS.red500,
            'HIGH': COLORS.amber500,
            'MEDIUM': COLORS.blue500,
            'LOW': COLORS.slate600
        };
        return colors[priority] || COLORS.slate600;
    };

    const stats = getStats();

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Yükleniyor...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <MaterialIcons name="arrow-back-ios" size={24} color={COLORS.textLight} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>İş Analizi & Raporlar</Text>
                <View style={{ width: 48 }} />
            </View>

            <ScrollView
                style={styles.scrollView}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
                }
            >
                {/* Stats Pills - Horizontal Scroll */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
                    <StatCard
                        label="Toplam Gelir"
                        value={`₺${stats.totalRevenue.toLocaleString()}`}
                        icon="attach-money"
                        iconColor={COLORS.green500}
                        style={styles.statCard}
                    />
                    <StatCard
                        label="Aktif İşler"
                        value={stats.active}
                        icon="work"
                        iconColor={COLORS.blue500}
                        style={styles.statCard}
                    />
                    <StatCard
                        label="Tamamlanan"
                        value={stats.completed}
                        icon="check-circle"
                        iconColor={COLORS.primary}
                        style={styles.statCard}
                    />
                    <StatCard
                        label="Bekleyen"
                        value={stats.pending}
                        icon="pending"
                        iconColor={COLORS.amber500}
                        style={styles.statCard}
                    />
                </ScrollView>

                {/* Jobs List */}
                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>Detaylı İşler</Text>
                    <Text style={styles.jobCount}>{jobs.length} İş</Text>
                </View>

                {jobs.slice(0, 10).map((job) => (
                    <TouchableOpacity
                        key={job.id}
                        style={styles.jobCard}
                        onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                    >
                        <View style={styles.jobCardContent}>
                            <View style={styles.jobLeft}>
                                <Text style={styles.jobTitle}>{job.title}</Text>
                                <Text style={styles.jobCustomer}>{job.customer?.company || 'Müşteri Bilinmiyor'}</Text>
                                <View style={styles.jobMeta}>
                                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(job.status) + '20' }]}>
                                        <Text style={[styles.statusText, { color: getStatusColor(job.status) }]}>
                                            {getStatusLabel(job.status)}
                                        </Text>
                                    </View>
                                    {job.priority && (
                                        <View style={[styles.priorityBadge, { borderColor: getPriorityColor(job.priority) }]}>
                                            <Text style={[styles.priorityText, { color: getPriorityColor(job.priority) }]}>
                                                {job.priority}
                                            </Text>
                                        </View>
                                    )}
                                </View>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={COLORS.slate500} />
                        </View>
                    </TouchableOpacity>
                ))}

                {jobs.length === 0 && (
                    <View style={styles.emptyState}>
                        <MaterialIcons name="work-outline" size={64} color={COLORS.slate600} />
                        <Text style={styles.emptyText}>Henüz iş eklenmemiş</Text>
                    </View>
                )}
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => Alert.alert('Yakında', 'İş ekleme özelliği yakında gelecek')}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={28} color={COLORS.black} />
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundDark,
    },
    loadingText: {
        marginTop: 10,
        color: COLORS.slate400,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        paddingBottom: 12,
        backgroundColor: COLORS.backgroundDark,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
        flex: 1,
        textAlign: 'center',
    },
    scrollView: {
        flex: 1,
    },
    statsContainer: {
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    statCard: {
        minWidth: 140,
        marginHorizontal: 4,
    },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    jobCount: {
        fontSize: 14,
        color: COLORS.slate400,
    },
    jobCard: {
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: COLORS.slate800,
        borderRadius: 12,
        marginHorizontal: 16,
        marginBottom: 12,
        padding: 16,
    },
    jobCardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    jobLeft: {
        flex: 1,
    },
    jobTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    jobCustomer: {
        fontSize: 14,
        color: COLORS.slate400,
        marginBottom: 8,
    },
    jobMeta: {
        flexDirection: 'row',
        gap: 8,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    priorityBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    priorityText: {
        fontSize: 12,
        fontWeight: '600',
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.slate500,
        marginTop: 16,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
