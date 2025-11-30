import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Image,
    StatusBar,
    SafeAreaView,
    Dimensions,
    RefreshControl
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/job.service';
import { COLORS } from '../../constants/theme';
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

    // Mock Data for UI
    const projects = [
        { id: 1, name: 'Merkez Ofis Yenileme', code: 'PRJ-001', progress: 75 },
        { id: 2, name: 'Depo Genişletme', code: 'PRJ-002', progress: 30 },
        { id: 3, name: 'Yeni Şube Kurulumu', code: 'PRJ-003', progress: 90 },
    ];

    useEffect(() => { loadDashboardData(); }, []);

    const loadDashboardData = async () => {
        try {
            // Mocking data for now to match design
            setStats({ activeJobs: 12, completedJobs: 8, totalEarnings: 15400 });
            setActiveJobs([
                {
                    id: '1',
                    title: 'Ofis Masası Montajı',
                    location: 'Levent, İstanbul',
                    time: '10:00 - 12:00',
                    status: 'In Progress',
                    progress: 60
                },
                {
                    id: '2',
                    title: 'Mutfak Dolabı Kurulumu',
                    location: 'Kadıköy, İstanbul',
                    time: '14:00 - 16:00',
                    status: 'Pending',
                    progress: 0
                }
            ]);
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
                        <Text style={styles.roleText}>Rol: {user?.role || 'Bilinmiyor'}</Text>
                    </View>
                </View>
                {/* Header Icons */}
                <View style={styles.headerIcons}>
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
    );

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
                <TouchableOpacity style={[styles.filterTab, styles.activeFilterTab]}>
                    <Text style={[styles.filterText, styles.activeFilterText]}>Tümü</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterTab}>
                    <Text style={styles.filterText}>Devam Eden</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterTab}>
                    <Text style={styles.filterText}>Bekleyen</Text>
                </TouchableOpacity>
            </View>

            {/* Task Cards */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tasksScroll}>
                {activeJobs.map((job) => (
                    <JobCard
                        key={job.id}
                        job={job}
                        onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                        style={{ width: width * 0.75, marginRight: 16 }}
                    />
                ))}
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
                {renderHeader()}
                {renderActiveTasks()}

                {/* Stats Grid */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>İstatistikler</Text>
                    {renderStatsGrid()}
                </View>

                {/* Cost Overview */}
                <View style={styles.sectionContainer}>
                    <TouchableOpacity
                        style={styles.costCard}
                        onPress={() => navigation.navigate('ExpenseManagement')}
                    >
                        <View style={styles.costHeader}>
                            <View>
                                <Text style={styles.costTitle}>Masraflar</Text>
                                <Text style={styles.costAmount}>₺{stats.totalEarnings.toLocaleString()}</Text>
                            </View>
                            <View style={styles.costIconCircle}>
                                <MaterialIcons name="account-balance-wallet" size={24} color={COLORS.black} />
                            </View>
                        </View>
                        <View style={styles.costTrend}>
                            <MaterialIcons name="trending-up" size={16} color={COLORS.black} />
                            <Text style={styles.trendText}>Geçen aya göre +12%</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {/* Project Status */}
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Proje Durumu</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                        <Text style={styles.viewAllText}>Tümünü Gör</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.projectList}>
                    {projects.map((project) => (
                        <TouchableOpacity key={project.id} style={styles.projectCard}>
                            <View style={styles.projectProgressContainer}>
                                <Text style={styles.projectProgressText}>{project.progress}%</Text>
                                <View style={styles.miniProgressBarBg}>
                                    <View style={[styles.miniProgressBarFill, { width: `${project.progress}%` }]} />
                                </View>
                            </View>

                            <View style={styles.projectInfo}>
                                <Text style={styles.projectTitle}>{project.name}</Text>
                                <Text style={styles.projectCode}>{project.code}</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={24} color={COLORS.slate500} />
                        </TouchableOpacity>
                    ))}
                </View>

                <View style={{ height: 80 }} />
            </ScrollView>

            {/* FAB */}
            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('Jobs')}
                activeOpacity={0.8}
            >
                <MaterialIcons name="add" size={30} color={COLORS.black} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: COLORS.backgroundDark },
    scrollContent: { padding: 16 },
    header: { marginBottom: 24 },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    profileSection: { flexDirection: 'row', alignItems: 'center' },
    profileImageContainer: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2, borderColor: COLORS.primary, backgroundColor: COLORS.slate800, justifyContent: 'center', alignItems: 'center' },
    profileInitials: { fontSize: 20, fontWeight: 'bold', color: COLORS.primary },
    greetingText: { color: COLORS.slate400, fontSize: 14 },
    userName: { color: COLORS.white, fontSize: 18, fontWeight: 'bold' },
    headerIcons: { flexDirection: 'row', gap: 12 },
    iconButton: { width: 40, height: 40, borderRadius: 20, backgroundColor: COLORS.cardDark, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: COLORS.slate800 },
    notificationBadge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.primary },
    dateText: { color: COLORS.slate500, fontSize: 14, marginTop: 4 },
    sectionContainer: { marginBottom: 24 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: COLORS.white },
    viewAllText: { color: COLORS.primary, fontSize: 14, fontWeight: '600' },
    filterContainer: { flexDirection: 'row', marginBottom: 16, gap: 12 },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: COLORS.cardDark, borderWidth: 1, borderColor: COLORS.slate800 },
    activeFilterTab: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
    filterText: { color: COLORS.slate400, fontSize: 14, fontWeight: '500' },
    activeFilterText: { color: COLORS.black, fontWeight: 'bold' },
    tasksScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
    statsGrid: { flexDirection: 'row', gap: 16 },
    costCard: { backgroundColor: COLORS.primary, borderRadius: 20, padding: 20 },
    costHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
    costTitle: { color: COLORS.black, fontSize: 14, fontWeight: '600', marginBottom: 4 },
    costAmount: { color: COLORS.black, fontSize: 28, fontWeight: 'bold' },
    costIconCircle: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(0,0,0,0.1)', justifyContent: 'center', alignItems: 'center' },
    costTrend: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(255,255,255,0.3)', alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    trendText: { color: COLORS.black, fontSize: 12, fontWeight: '600' },
    projectList: { gap: 12 },
    projectCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.cardDark, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: COLORS.slate800 },
    projectProgressContainer: { alignItems: 'center', marginRight: 16, width: 50 },
    projectProgressText: { color: COLORS.primary, fontSize: 12, fontWeight: 'bold', marginBottom: 4 },
    miniProgressBarBg: { width: '100%', height: 4, backgroundColor: COLORS.slate700, borderRadius: 2 },
    miniProgressBarFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 2 },
    projectInfo: { flex: 1 },
    projectTitle: { color: COLORS.white, fontSize: 16, fontWeight: '600', marginBottom: 4 },
    projectCode: { color: COLORS.slate500, fontSize: 14 },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: COLORS.primary, justifyContent: 'center', alignItems: 'center', shadowColor: COLORS.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 }
});
