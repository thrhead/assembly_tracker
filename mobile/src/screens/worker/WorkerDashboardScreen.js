import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    Dimensions,
    RefreshControl,
    LayoutAnimation,
    Platform,
    UIManager,
    ActivityIndicator
} from 'react-native';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/job.service';
import costService from '../../services/cost.service';
import { COLORS } from '../../constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import GradientCard from '../../components/ui/GradientCard';
import StatCard from '../../components/StatCard';
import JobCard from '../../components/JobCard';

const { width } = Dimensions.get('window');

export default function WorkerDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        activeJobs: 0,
        completedJobs: 0,
        totalEarnings: 0
    });
    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL'); // 'ALL', 'IN_PROGRESS', 'PENDING'

    const handleFilterChange = (filter) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveFilter(filter);
    };

    // Mock Data for UI
    // Mock Data for UI removed

    useFocusEffect(
        useCallback(() => {
            loadDashboardData();
        }, [])
    );

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const jobs = await jobService.getMyJobs();
            const costs = await costService.getMyCosts();

            // Filter active and completed jobs
            const active = jobs.filter(j => ['PENDING', 'IN_PROGRESS'].includes(j.status));
            const completed = jobs.filter(j => j.status === 'COMPLETED');

            // Process active jobs for display
            const formattedActiveJobs = active.map(job => {
                const totalSteps = job.steps ? job.steps.length : 0;
                const completedSteps = job.steps ? job.steps.filter(s => s.isCompleted).length : 0;
                const progress = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

                return {
                    id: job.id,
                    title: job.title,
                    location: job.location || job.customer?.company || 'Konum belirtilmemiş',
                    time: job.scheduledDate ? new Date(job.scheduledDate).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) : 'Saat belirtilmemiş',
                    status: job.status === 'IN_PROGRESS' ? 'In Progress' : 'Pending',
                    progress: progress,
                    priority: job.priority
                };
            });

            setActiveJobs(formattedActiveJobs);
            setStats({
                activeJobs: active.length,
                completedJobs: completed.length,
                totalEarnings: costs ? costs.reduce((sum, cost) => sum + (cost.amount || 0), 0) : 0
            });

        } catch (error) {
            console.error('Error loading dashboard data:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => { setRefreshing(true); loadDashboardData(); };

    const renderHeader = () => (
        <View style={styles.header}>
            <LinearGradient
                colors={['rgba(22, 163, 74, 0.15)', 'transparent']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
            />
            <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                    {/* Profile Section */}
                    <View style={styles.profileSection}>
                        {/* Profile Image */}
                        <View style={styles.profileImageContainer}>
                            <Text style={styles.profileInitials}>{user?.name ? user.name.charAt(0).toUpperCase() : 'Ç'}</Text>
                        </View>
                        {/* Greeting and Role */}
                        <View>
                            <Text style={styles.greetingText}>Merhaba,</Text>
                            <Text style={styles.userName}>{user?.name || 'Çalışan'}</Text>
                            <View style={styles.roleContainer}>
                                <Text style={styles.roleText}>{user?.role || 'Bilinmiyor'}</Text>
                            </View>
                        </View>
                    </View>
                    {/* Header Icons */}
                    <View style={styles.headerIcons}>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Calendar')}>
                            <MaterialIcons name="calendar-today" size={24} color={COLORS.primary} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notifications')}>
                            <MaterialIcons name="notifications-none" size={24} color={COLORS.primary} />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.iconButton} onPress={logout}>
                            <MaterialIcons name="logout" size={24} color={COLORS.red500} />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={styles.dateText}>{new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</Text>
            </View>
        </View>
    );

    const getFilteredJobs = () => {
        if (activeFilter === 'ALL') return activeJobs;
        if (activeFilter === 'IN_PROGRESS') return activeJobs.filter(job => job.status === 'In Progress');
        if (activeFilter === 'PENDING') return activeJobs.filter(job => job.status === 'Pending');
        return activeJobs;
    };

    const renderActiveTasks = () => (
        <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Aktif Görevler</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                    <Text style={styles.viewAllText}>Tümünü Gör</Text>
                </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                <TouchableOpacity
                    style={[styles.filterTab, activeFilter === 'ALL' && styles.activeFilterTab]}
                    onPress={() => handleFilterChange('ALL')}
                >
                    <Text style={[styles.filterText, activeFilter === 'ALL' && styles.activeFilterText]}>Tümü</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, activeFilter === 'IN_PROGRESS' && styles.activeFilterTab]}
                    onPress={() => handleFilterChange('IN_PROGRESS')}
                >
                    <Text style={[styles.filterText, activeFilter === 'IN_PROGRESS' && styles.activeFilterText]}>Devam Eden</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterTab, activeFilter === 'PENDING' && styles.activeFilterTab]}
                    onPress={() => handleFilterChange('PENDING')}
                >
                    <Text style={[styles.filterText, activeFilter === 'PENDING' && styles.activeFilterText]}>Bekleyen</Text>
                </TouchableOpacity>
            </View>

            {/* Task Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tasksScroll}>
                {getFilteredJobs().length > 0 ? (
                    getFilteredJobs().map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                            style={{ width: width * 0.75, marginRight: 16 }}
                        />
                    ))
                ) : (
                    <View style={styles.emptyStateContainer}>
                        <View style={styles.emptyStateIconContainer}>
                            <MaterialIcons
                                name={activeFilter === 'ALL' ? 'assignment' : activeFilter === 'PENDING' ? 'pending-actions' : 'hourglass-empty'}
                                size={32}
                                color={COLORS.slate400}
                            />
                        </View>
                        <Text style={styles.emptyStateText}>
                            {activeFilter === 'ALL' ? 'Aktif görev bulunmuyor' :
                                activeFilter === 'IN_PROGRESS' ? 'Devam eden görev yok' :
                                    'Bekleyen görev yok'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );

    const renderStatsGrid = () => (
        <View style={styles.statsGrid}>
            <StatCard label="Aktif İşler" value={stats.activeJobs} icon="assignment" style={{ flex: 1 }} />
            <StatCard label="Tamamlanan" value={stats.completedJobs} icon="check-circle" iconColor={COLORS.green500} style={{ flex: 1 }} />
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {loading && !refreshing ? (
                    <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                        <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                ) : (
                    <>
                        {renderHeader()}
                        {renderActiveTasks()}

                        {/* Stats Grid */}
                        <View style={styles.sectionContainer}>
                            <Text style={styles.sectionTitle}>İstatistikler</Text>
                            {renderStatsGrid()}
                        </View>

                        {/* Cost Overview */}
                        <View style={styles.sectionContainer}>
                            <GradientCard
                                style={styles.costCard}
                                onPress={() => navigation.navigate('ExpenseManagement')}
                                colors={[COLORS.primary, '#15803d']}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 1 }}
                            >
                                <View style={styles.costHeader}>
                                    <View>
                                        <Text style={styles.costTitle}>Masraflar</Text>
                                        <Text style={styles.costAmount}>₺{stats.totalEarnings.toLocaleString()}</Text>
                                    </View>
                                    <View style={styles.costIconCircle}>
                                        <MaterialIcons name="account-balance-wallet" size={24} color={COLORS.white} />
                                    </View>
                                </View>
                                <View style={styles.costTrend}>
                                    {/* Transparent white background for pill */}
                                    <View style={styles.trendPill}>
                                        <MaterialIcons name="trending-up" size={16} color={COLORS.white} />
                                        <Text style={styles.trendText}>Geçen aya göre +12%</Text>
                                    </View>
                                    <MaterialIcons name="chevron-right" size={24} color="rgba(255,255,255,0.8)" />
                                </View>
                            </GradientCard>
                        </View>

                        <View style={{ height: 80 }} />
                    </>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.backgroundDark },
    scrollContent: { paddingBottom: 40 }, // Removed padding: 16 to allow header to be full width if needed, but keeping simple for now. actually let's keep consistent padding but move header out of padding in future if needed. For now just update specific styles.
    header: { marginBottom: 24, marginHorizontal: -16, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 }, // Negative margin to stretch background
    headerContent: { zIndex: 1 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    profileSection: { flexDirection: 'row', alignItems: 'center' },
    profileImageContainer: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2, borderColor: COLORS.primary, backgroundColor: COLORS.slate800, justifyContent: 'center', alignItems: 'center' },
    profileInitials: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
    greetingText: { color: COLORS.slate400, fontSize: 13, marginBottom: 2 },
    userName: { color: COLORS.white, fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    roleContainer: { backgroundColor: 'rgba(22, 163, 74, 0.2)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
    roleText: { color: COLORS.primary, fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
    headerIcons: { flexDirection: 'row', gap: 12 },
    iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.cardDark, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.slate800 },
    notificationBadge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary, borderWidth: 1, borderColor: COLORS.cardDark },
    dateText: { color: COLORS.slate500, fontSize: 13, marginTop: 4, fontWeight: '500' },
    sectionContainer: { marginBottom: 28, paddingHorizontal: 16 }, // Adjusted providing padding here
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white, letterSpacing: 0.5 },
    viewAllText: { color: COLORS.primary, fontSize: 13, fontWeight: '600' },
    filterContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.cardDark, borderWidth: 1, borderColor: COLORS.slate800 },
    activeFilterTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { color: COLORS.slate400, fontSize: 13, fontWeight: '600' },
    activeFilterText: { color: COLORS.black, fontWeight: 'bold' },
    tasksScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
    statsGrid: { flexDirection: 'row', gap: 12 },
    costCard: { padding: 24, borderRadius: 24, minHeight: 160, justifyContent: 'space-between' },
    costHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    costTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600', marginBottom: 8 },
    costAmount: { color: COLORS.white, fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    costIconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,255,255,0.2)', justifyContent: 'center', alignItems: 'center' },
    costTrend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    trendPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    trendText: { color: COLORS.white, fontSize: 12, fontWeight: '700' },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
    emptyStateContainer: { width: width * 0.75, height: 160, backgroundColor: COLORS.cardDark, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.slate800, borderStyle: 'dashed' },
    emptyStateIconContainer: { width: 56, height: 56, borderRadius: 28, backgroundColor: 'rgba(255,255,255,0.03)', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    emptyStateText: { color: COLORS.slate400, fontSize: 14, fontWeight: '500' },
});
