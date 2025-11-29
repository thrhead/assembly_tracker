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
    Dimensions
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import jobService from '../../services/job.service';

const { width } = Dimensions.get('window');

const COLORS = {
    primary: "#CCFF04",
    backgroundLight: "#f8f8f5",
    backgroundDark: "#010100",
    cardDark: "#1A1A1A",
    textLight: "#e2e8f0",
    textDark: "#1e293b",
    slate400: "#94a3b8",
    slate500: "#64748b",
    slate600: "#475569",
    slate700: "#334155",
    slate800: "#1e293b",
    slate900: "#0f172a",
    white: "#ffffff",
    amber500: "#f59e0b",
};

export default function WorkerDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState({
        activeJobs: 0,
        completedJobs: 0,
        totalEarnings: 0
    });
    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Mock Data for UI
    const projects = [
        { id: 1, name: 'Merkez Ofis Yenileme', code: 'PRJ-001', progress: 75 },
        { id: 2, name: 'Depo Genişletme', code: 'PRJ-002', progress: 30 },
        { id: 3, name: 'Yeni Şube Kurulumu', code: 'PRJ-003', progress: 90 },
    ];

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            // In a real scenario, fetch data from API
            // const dashboardData = await jobService.getDashboardStats();
            // setStats(dashboardData);

            // Mocking data for now to match design
            setStats({
                activeJobs: 12,
                completedJobs: 8,
                totalEarnings: 15400
            });

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
        }
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={styles.headerTop}>
                <View style={styles.profileSection}>
                    <Image
                        source={{ uri: 'https://i.pravatar.cc/100?img=33' }}
                        style={styles.profileImage}
                    />
                    <View>
                        <Text style={styles.greetingText}>Merhaba,</Text>
                        <Text style={styles.userName}>{user?.name || 'Çalışan'}</Text>
                    </View>
                </View>
                <View style={styles.headerIcons}>
                    <TouchableOpacity style={styles.iconButton}>
                        <MaterialIcons name="notifications-none" size={24} color={COLORS.white} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={logout}>
                        <MaterialIcons name="logout" size={24} color={COLORS.white} />
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
                    <TouchableOpacity
                        key={job.id}
                        style={styles.taskCard}
                        onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                    >
                        <View style={styles.taskHeader}>
                            <View style={[styles.statusBadge, job.status === 'In Progress' ? styles.statusInProgress : styles.statusPending]}>
                                <Text style={[styles.statusText, job.status === 'In Progress' ? styles.textInProgress : styles.textPending]}>
                                    {job.status === 'In Progress' ? 'Devam Ediyor' : 'Bekliyor'}
                                </Text>
                            </View>
                            <MaterialIcons name="more-horiz" size={20} color={COLORS.slate500} />
                        </View>

                        <Text style={styles.taskTitle}>{job.title}</Text>

                        <View style={styles.taskInfo}>
                            <View style={styles.infoRow}>
                                <MaterialIcons name="location-on" size={16} color={COLORS.slate500} />
                                <Text style={styles.infoText}>{job.location}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialIcons name="access-time" size={16} color={COLORS.slate500} />
                                <Text style={styles.infoText}>{job.time}</Text>
                            </View>
                        </View>

                        <View style={styles.progressContainer}>
                            <View style={styles.progressBarBg}>
                                <View style={[styles.progressBarFill, { width: `${job.progress}%` }]} />
                            </View>
                            <Text style={styles.progressText}>{job.progress}%</Text>
                        </View>

                        <View style={styles.avatarsContainer}>
                            <Image source={{ uri: 'https://i.pravatar.cc/100?img=12' }} style={styles.avatar} />
                            <Image source={{ uri: 'https://i.pravatar.cc/100?img=33' }} style={[styles.avatar, styles.avatarOverlap]} />
                            <View style={[styles.avatar, styles.avatarOverlap, styles.addAvatar]}>
                                <MaterialIcons name="add" size={16} color={COLORS.white} />
                            </View>
                        </View>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );

    const renderStatsGrid = () => (
        <View style={styles.statsGrid}>
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(204, 255, 4, 0.1)' }]}>
                    <MaterialIcons name="assignment" size={24} color={COLORS.primary} />
                </View>
                <Text style={styles.statNumber}>{stats.activeJobs}</Text>
                <Text style={styles.statLabel}>Aktif İşler</Text>
            </View>
            <View style={styles.statCard}>
                <View style={[styles.iconBox, { backgroundColor: 'rgba(245, 158, 11, 0.1)' }]}>
                    <MaterialIcons name="check-circle" size={24} color={COLORS.amber500} />
                </View>
                <Text style={styles.statNumber}>{stats.completedJobs}</Text>
                <Text style={styles.statLabel}>Tamamlanan</Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.backgroundDark} />
            <ScrollView contentContainerStyle={styles.scrollContent}>
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
                            {/* Replaced Circular Progress with Linear for compatibility */}
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
            >
                <MaterialIcons name="add" size={30} color={COLORS.black} />
            </TouchableOpacity>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    scrollContent: {
        padding: 16,
    },
    header: {
        marginBottom: 24,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    profileSection: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileImage: {
        width: 50,
        height: 50,
        borderRadius: 25,
        marginRight: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    greetingText: {
        color: COLORS.slate400,
        fontSize: 14,
    },
    userName: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
    },
    headerIcons: {
        flexDirection: 'row',
        gap: 12,
    },
    iconButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    dateText: {
        color: COLORS.slate500,
        fontSize: 14,
        marginTop: 4,
    },
    sectionContainer: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
    },
    viewAllText: {
        color: COLORS.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    filterContainer: {
        flexDirection: 'row',
        marginBottom: 16,
        gap: 12,
    },
    filterTab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    activeFilterTab: {
        backgroundColor: COLORS.primary,
    },
    filterText: {
        color: COLORS.slate400,
        fontSize: 14,
        fontWeight: '500',
    },
    activeFilterText: {
        color: COLORS.black,
        fontWeight: 'bold',
    },
    tasksScroll: {
        marginHorizontal: -16,
        paddingHorizontal: 16,
    },
    taskCard: {
        width: width * 0.7,
        backgroundColor: COLORS.cardDark,
        borderRadius: 16,
        padding: 16,
        marginRight: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    taskHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    statusBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusInProgress: {
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
    },
    statusPending: {
        backgroundColor: 'rgba(245, 158, 11, 0.1)',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    textInProgress: {
        color: COLORS.primary,
    },
    textPending: {
        color: COLORS.amber500,
    },
    taskTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    taskInfo: {
        gap: 8,
        marginBottom: 16,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        color: COLORS.slate400,
        fontSize: 14,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 16,
    },
    progressBarBg: {
        flex: 1,
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 3,
    },
    progressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 3,
    },
    progressText: {
        color: COLORS.white,
        fontSize: 12,
        fontWeight: '600',
    },
    avatarsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: COLORS.cardDark,
    },
    avatarOverlap: {
        marginLeft: -10,
    },
    addAvatar: {
        backgroundColor: COLORS.slate700,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: COLORS.cardDark,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconBox: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    statNumber: {
        color: COLORS.white,
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statLabel: {
        color: COLORS.slate400,
        fontSize: 14,
    },
    costCard: {
        backgroundColor: COLORS.primary,
        borderRadius: 20,
        padding: 20,
    },
    costHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    costTitle: {
        color: COLORS.black,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    costAmount: {
        color: COLORS.black,
        fontSize: 28,
        fontWeight: 'bold',
    },
    costIconCircle: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    costTrend: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        backgroundColor: 'rgba(255,255,255,0.3)',
        alignSelf: 'flex-start',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    trendText: {
        color: COLORS.black,
        fontSize: 12,
        fontWeight: '600',
    },
    projectList: {
        gap: 12,
    },
    projectCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    projectProgressContainer: {
        alignItems: 'center',
        marginRight: 16,
        width: 50,
    },
    projectProgressText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    miniProgressBarBg: {
        width: '100%',
        height: 4,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 2,
    },
    miniProgressBarFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
        borderRadius: 2,
    },
    projectInfo: {
        flex: 1,
    },
    projectTitle: {
        color: COLORS.white,
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    projectCode: {
        color: COLORS.slate500,
        fontSize: 14,
    },
    fab: {
        position: 'absolute',
        bottom: 24,
        right: 24,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
});
