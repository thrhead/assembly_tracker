import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    Dimensions,
    RefreshControl,
    LayoutAnimation,
    Platform,
    UIManager,
    ActivityIndicator,
    StatusBar,
    Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import jobService from '../../services/job.service';
import costService from '../../services/cost.service';
import { LinearGradient } from 'expo-linear-gradient';
import StatCard from '../../components/StatCard';
import JobCard from '../../components/JobCard';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width } = Dimensions.get('window');

// Dynamic Glass Card Component
const GlassCard = ({ children, style, onPress, theme }) => (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress}>
        <View style={[
            styles.glassCard,
            {
                backgroundColor: theme.colors.card,
                borderColor: theme.colors.cardBorder
            },
            style
        ]}>
            {children}
        </View>
    </TouchableOpacity>
);

export default function WorkerDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();

    // State
    const [stats, setStats] = useState({
        activeJobs: 0,
        completedJobs: 0,
        totalEarnings: 0
    });
    const [activeJobs, setActiveJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeFilter, setActiveFilter] = useState('ALL');

    const handleFilterChange = (filter) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveFilter(filter);
    };

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

            const active = jobs.filter(j => ['PENDING', 'IN_PROGRESS'].includes(j.status));
            const completed = jobs.filter(j => j.status === 'COMPLETED');

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
            <View style={styles.headerContent}>
                <View style={styles.headerTop}>
                    <View style={styles.profileSection}>
                        <View style={[styles.profileImageContainer, { borderColor: theme.colors.primary, backgroundColor: theme.colors.card }]}>
                            <Text style={[styles.profileInitials, { color: theme.colors.primary }]}>{user?.name ? user.name.charAt(0).toUpperCase() : 'Ç'}</Text>
                        </View>
                        <View>
                            <Text style={[styles.greetingText, { color: isDark ? 'rgba(255,255,255,0.6)' : theme.colors.text }]}>Merhaba,</Text>
                            <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name || 'Çalışan'}</Text>
                            <View style={[styles.roleContainer, { backgroundColor: isDark ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.1)' }]}>
                                <Text style={[styles.roleText, { color: theme.colors.primary }]}>{user?.role || 'Bilinmiyor'}</Text>
                            </View>
                        </View>
                    </View>
                    <View style={styles.headerIcons}>
                        {/* THEME TOGGLE BUTTON */}
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                            onPress={toggleTheme}
                        >
                            <MaterialIcons name={isDark ? "light-mode" : "dark-mode"} size={24} color={theme.colors.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]} onPress={() => navigation.navigate('Calendar')}>
                            <MaterialIcons name="calendar-today" size={24} color={theme.colors.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.iconButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]} onPress={() => navigation.navigate('Notifications')}>
                            <MaterialIcons name="notifications-none" size={24} color={theme.colors.icon} />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.iconButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                            onPress={() => {
                                const performLogout = async () => {
                                    try {
                                        await logout();
                                    } catch (error) {
                                        console.error('Logout error:', error);
                                    }
                                };

                                if (Platform.OS === 'web') {
                                    if (window.confirm('Çıkış yapmak istediğinize emin misiniz?')) {
                                        performLogout();
                                    }
                                } else {
                                    Alert.alert(
                                        'Çıkış Yap',
                                        'Çıkmak istediğinize emin misiniz?',
                                        [
                                            { text: 'İptal', style: 'cancel' },
                                            {
                                                text: 'Çıkış Yap',
                                                style: 'destructive',
                                                onPress: performLogout
                                            }
                                        ]
                                    );
                                }
                            }}
                        >
                            <MaterialIcons name="logout" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>
                <Text style={[styles.dateText, { color: isDark ? 'rgba(255,255,255,0.5)' : theme.colors.text }]}>
                    {new Date().toLocaleDateString('tr-TR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </Text>
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
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aktif Görevler</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                    <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>Tümü</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
                {['ALL', 'IN_PROGRESS', 'PENDING'].map(filter => (
                    <TouchableOpacity
                        key={filter}
                        style={[
                            styles.filterTab,
                            {
                                backgroundColor: activeFilter === filter ? theme.colors.tabActive : theme.colors.tab,
                                borderColor: theme.colors.cardBorder
                            }
                        ]}
                        onPress={() => handleFilterChange(filter)}
                    >
                        <Text style={[
                            styles.filterText,
                            {
                                color: activeFilter === filter ? (isDark ? '#000' : '#fff') : (isDark ? 'rgba(255,255,255,0.6)' : theme.colors.text),
                                fontWeight: activeFilter === filter ? 'bold' : '600'
                            }
                        ]}>
                            {filter === 'ALL' ? 'Tümü' : filter === 'IN_PROGRESS' ? 'Devam Eden' : 'Bekleyen'}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tasksScroll}>
                {getFilteredJobs().length > 0 ? (
                    getFilteredJobs().map((job) => (
                        <JobCard
                            key={job.id}
                            job={job}
                            onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                            style={{ width: width * 0.75, marginRight: 16 }}
                        // Pass theme prop if JobCard supports it, or it uses theme inside
                        />
                    ))
                ) : (
                    <View style={[styles.emptyStateContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                        <View style={[styles.emptyStateIconContainer, { backgroundColor: theme.colors.card }]}>
                            <MaterialIcons
                                name={activeFilter === 'ALL' ? 'assignment' : activeFilter === 'PENDING' ? 'pending-actions' : 'hourglass-empty'}
                                size={32}
                                color={theme.colors.text}
                            />
                        </View>
                        <Text style={[styles.emptyStateText, { color: theme.colors.text }]}>
                            {activeFilter === 'ALL' ? 'Aktif görev bulunmuyor' :
                                activeFilter === 'IN_PROGRESS' ? 'Devam eden görev yok' :
                                    'Bekleyen görev yok'}
                        </Text>
                    </View>
                )}
            </ScrollView>
        </View>
    );

    return (
        <LinearGradient
            colors={theme.colors.gradient}
            start={theme.colors.gradientStart}
            end={theme.colors.gradientEnd}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={{ flex: 1 }}>
                <StatusBar
                    barStyle={isDark ? "light-content" : "dark-content"}
                    backgroundColor="transparent"
                    translucent
                />

                {/* Hero Circle Effect for Light Mode */}
                {!isDark && (
                    <View style={styles.heroCircleContainer}>
                        {/* Optional decorative circles can go here if needed to match HTML exactly */}
                    </View>
                )}

                <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                >
                    {loading && !refreshing ? (
                        <View style={{ height: 200, justifyContent: 'center', alignItems: 'center' }}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                        </View>
                    ) : (
                        <>
                            {renderHeader()}
                            {renderActiveTasks()}

                            <View style={styles.sectionContainer}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>İstatistikler</Text>
                                <View style={styles.statsGrid}>
                                    <StatCard label="Aktif İşler" value={stats.activeJobs} icon="assignment" style={{ flex: 1 }} />
                                    <StatCard label="Tamamlanan" value={stats.completedJobs} icon="check-circle" iconColor="#22c55e" style={{ flex: 1 }} />
                                </View>
                            </View>

                            <View style={styles.sectionContainer}>
                                <GlassCard
                                    style={styles.costCard}
                                    onPress={() => navigation.navigate('ExpenseManagement')}
                                    theme={theme}
                                >
                                    <View style={styles.costHeader}>
                                        <View>
                                            <Text style={[styles.costTitle, { color: theme.colors.text }]}>Masraflar</Text>
                                            <Text style={[styles.costAmount, { color: theme.colors.text }]}>₺{stats.totalEarnings.toLocaleString()}</Text>
                                        </View>
                                        <View style={[styles.costIconCircle, { backgroundColor: theme.colors.cardBorder }]}>
                                            <MaterialIcons name="account-balance-wallet" size={24} color={theme.colors.text} />
                                        </View>
                                    </View>
                                    <View style={styles.costTrend}>
                                        <View style={styles.trendPill}>
                                            <MaterialIcons name="trending-up" size={16} color="#10B981" />
                                            <Text style={styles.trendText}>+12%</Text>
                                        </View>
                                        <MaterialIcons name="chevron-right" size={24} color={theme.colors.text} />
                                    </View>
                                </GlassCard>
                            </View>

                            <View style={{ height: 80 }} />
                        </>
                    )}
                </ScrollView>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    scrollContent: { paddingBottom: 40 },
    header: { marginBottom: 24, paddingHorizontal: 16, paddingTop: 16, paddingBottom: 24 },
    headerContent: {},
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    profileSection: { flexDirection: 'row', alignItems: 'center' },
    profileImageContainer: { width: 50, height: 50, borderRadius: 25, marginRight: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
    profileInitials: { fontSize: 20, fontWeight: 'bold' },
    greetingText: { fontSize: 13, marginBottom: 2 },
    userName: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
    roleContainer: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
    roleText: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5 },
    headerIcons: { flexDirection: 'row', gap: 12 },
    iconButton: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
    notificationBadge: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', borderWidth: 1, borderColor: '#fff' },
    dateText: { fontSize: 13, marginTop: 4, fontWeight: '500' },
    sectionContainer: { marginBottom: 28, paddingHorizontal: 16 },
    sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
    viewAllText: { fontSize: 13, fontWeight: '600' },
    filterContainer: { flexDirection: 'row', marginBottom: 20, gap: 10 },
    filterTab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
    filterText: { fontSize: 13, fontWeight: '600' },
    tasksScroll: { marginHorizontal: -16, paddingHorizontal: 16 },
    statsGrid: { flexDirection: 'row', gap: 12 },
    glassCard: { padding: 24, borderRadius: 24, borderWidth: 1, minHeight: 160, justifyContent: 'space-between' },
    costCard: { minHeight: 160 },
    costHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    costTitle: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
    costAmount: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
    costIconCircle: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
    costTrend: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    trendPill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(16, 185, 129, 0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    trendText: { color: '#10B981', fontSize: 12, fontWeight: '700' },
    emptyStateContainer: { width: width * 0.75, height: 160, borderRadius: 24, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderStyle: 'dashed' },
    emptyStateIconContainer: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    emptyStateText: { fontSize: 14, fontWeight: '500' },
    heroCircleContainer: { position: 'absolute', top: 0, left: 0, right: 0, height: 300, overflow: 'hidden' }, // Placeholder for HTML circle decorations
    tasksList: {
        gap: 16,
    },
    taskCard: {
        padding: 0, // Reset padding for custom layout
        borderRadius: 22,
        marginBottom: 8,
    },
    leftBorderStrip: {
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: 0,
        width: 4,
        zIndex: 1,
    },
    taskCardContent: {
        flexDirection: 'row',
        padding: 16,
        paddingLeft: 20, // Account for border strip
        alignItems: 'center',
        gap: 16,
    },
    taskIconBox: {
        width: 48,
        height: 48,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    taskCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    taskTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 8,
    },
    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    priorityText: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    taskMeta: {
        fontSize: 13,
        marginBottom: 12,
    },
    taskFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    avatarGroup: {
        flexDirection: 'row',
    },
    miniAvatar: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
    },
    teamName: {
        fontSize: 11,
        fontWeight: '500',
    },
    labelSmall: {
        fontSize: 12,
        fontWeight: '600',
        textTransform: 'uppercase',
        marginBottom: 4,
        letterSpacing: 0.5,
    },
    bigAmount: {
        fontSize: 30,
        fontWeight: '800',
        letterSpacing: -1,
    },
    trendBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
    },
    trendText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    progressLabel: {
        fontSize: 12,
        fontWeight: '600',
    },
    progressBarBg: {
        height: 8,
        width: '100%',
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 4,
    },
    costFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 16,
        borderTopWidth: 1,
    },
    labelTiny: {
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    amountSmall: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    smallButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 12,
    },
});
