import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Alert, Platform, FlatList, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
    Users, Building2, UsersRound, Briefcase, ClipboardCheck, Banknote,
    Calendar, TrendingUp, BarChart3, Sun, Moon, PlusCircle, UserPlus, ChevronRight, ShieldCheck
} from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../../components/ui/GlassCard';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import CustomDrawer from '../../components/admin/CustomDrawer';
import DashboardStatsGrid from '../../components/admin/DashboardStatsGrid';
import { BarChart } from 'react-native-gifted-charts';
import RecentJobsList from '../../components/admin/RecentJobsList';
import DashboardBottomNav from '../../components/admin/DashboardBottomNav';
import { API_URL } from '../../config';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
    const { t } = useTranslation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const { statsData, recentJobs, fetchStats } = useDashboardStats();

    useEffect(() => {
        fetchStats();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchStats();
        setRefreshing(false);
    };

    // Prepare chart data from statsData.weeklyStats
    const chartData = (statsData?.weeklyStats || []).map(stat => ({
        value: stat.count,
        label: stat.name,
        frontColor: theme.colors.primary,
        gradientColor: theme.colors.primary,
        topLabelComponent: () => (
            <Text style={{ color: theme.colors.text, fontSize: 10, fontWeight: 'bold', marginBottom: 4 }}>{stat.count}</Text>
        )
    }));

    const handleLogout = async () => {
        const performLogout = async () => {
            try {
                await logout();
            } catch (error) {
                console.error('Logout error:', error);
            }
        };

        if (Platform.OS === 'web') {
            if (window.confirm(t('profile.logoutConfirmDesc'))) {
                performLogout();
            }
        } else {
            Alert.alert(
                t('profile.logoutConfirmTitle'),
                t('profile.logoutConfirmDesc'),
                [
                    { text: t('common.cancel'), style: 'cancel' },
                    {
                        text: t('profile.logoutConfirmTitle'),
                        style: 'destructive',
                        onPress: performLogout
                    }
                ]
            );
        }
    };
    const navItems = [
        { id: 'users', title: t('navigation.userManagement'), icon: Users, route: 'UserManagement', color: theme.colors.primary },
        { id: 'customers', title: t('navigation.customers'), icon: Building2, route: 'CustomerManagement', color: theme.colors.tertiary },
        { id: 'teams', title: t('navigation.teams'), icon: UsersRound, route: 'TeamManagement', color: theme.colors.secondary },
        { id: 'jobs', title: t('navigation.jobs'), icon: Briefcase, route: 'Jobs', color: '#f97316' }, // Orange
        { id: 'approvals', title: t('navigation.approvals'), icon: ClipboardCheck, route: 'Approvals', color: '#14b8a6' }, // Teal
        { id: 'costs', title: t('worker.expenses'), icon: Banknote, route: 'CostManagement', color: '#22c55e' }, // Green
        { id: 'calendar', title: t('navigation.calendar') || 'Calendar', icon: Calendar, route: 'Calendar', color: '#a855f7' }, // Purple
        { id: 'planning', title: t('navigation.planning') || 'Planning', icon: TrendingUp, route: 'AdvancedPlanning', color: theme.colors.primary },
        { id: 'reports', title: t('navigation.reports') || 'Reports', icon: BarChart3, route: 'Reports', color: '#3b82f6' }, // Blue
        { id: 'webhooks', title: 'Webhook Monitoring', icon: ShieldCheck, route: 'Webhooks', color: '#6366f1' }, // Indigo
    ];

    const handleNavPress = (route) => {
        setIsDrawerOpen(false);
        navigation.navigate(route);
    };

    return (
        <LinearGradient
            colors={theme.colors.gradient}
            start={theme.colors.gradientStart}
            end={theme.colors.gradientEnd}
            style={{ flex: 1 }}
        >
            <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
                <StatusBar
                    barStyle={isDark ? "light-content" : "dark-content"}
                    backgroundColor="transparent"
                    translucent
                />

                <CustomDrawer
                    visible={isDrawerOpen}
                    onClose={() => setIsDrawerOpen(false)}
                    user={user}
                    navItems={navItems}
                    onNavigate={handleNavPress}
                    onLogout={handleLogout}
                />

                <FlatList
                    style={styles.scrollView}
                    contentContainerStyle={[styles.scrollContent, { flexGrow: 1 }]}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                    showsVerticalScrollIndicator={false}
                    data={recentJobs}
                    keyExtractor={(item) => item.id.toString()}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    removeClippedSubviews={Platform.OS === 'android'}
                    ListHeaderComponent={
                        <>
                            {/* Header Container */}
                            <View style={styles.headerContainer}>
                                <View style={styles.headerContent}>
                                    <View style={styles.userInfo}>
                                        <Text style={[styles.welcomeLabel, { color: theme.colors.subText }]}>{t('auth.welcome')},</Text>
                                        <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name || 'Admin'}</Text>
                                    </View>

                                    <View style={{ flexDirection: 'row', gap: 12 }}>
                                        <TouchableOpacity
                                            style={[styles.iconButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                                            onPress={toggleTheme}
                                        >
                                            {isDark ? <Sun size={24} color={theme.colors.icon} /> : <Moon size={24} color={theme.colors.icon} />}
                                        </TouchableOpacity>

                                        <TouchableOpacity
                                            style={styles.profileButton}
                                            onPress={() => navigation.navigate('Profile')}
                                        >
                                            <View style={[styles.avatarCircle, { backgroundColor: theme.colors.primary }]}>
                                                <Text style={[styles.avatarText, { color: isDark ? '#000' : '#fff' }]}>
                                                    {user?.name?.charAt(0) || 'A'}
                                                </Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>

                            <View style={styles.mainContent}>
                                {/* Weekly Performance Chart (WEB PARITY) */}
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Haftalık Tamamlanan Adımlar</Text>
                                    <View style={[styles.chartContainer, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                                        <BarChart
                                            data={chartData}
                                            width={width - 80}
                                            height={180}
                                            barWidth={24}
                                            spacing={12}
                                            noOfSections={3}
                                            barBorderRadius={6}
                                            hideRules
                                            xAxisThickness={0}
                                            yAxisThickness={0}
                                            yAxisTextStyle={{ color: theme.colors.subText, fontSize: 10 }}
                                            xAxisLabelTextStyle={{ color: theme.colors.subText, fontSize: 10 }}
                                            showGradient
                                            isAnimated
                                        />
                                    </View>
                                </View>

                                <DashboardStatsGrid statsData={statsData} />

                                {/* Active Workers (WEB PARITY) */}
                                {statsData?.activeWorkers?.length > 0 && (
                                    <View style={styles.section}>
                                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Aktif Çalışanlar</Text>
                                            <TouchableOpacity onPress={() => navigation.navigate('TeamManagement')}>
                                                <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.primary }}>Tümünü Gör</Text>
                                            </TouchableOpacity>
                                        </View>
                                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                                            {statsData.activeWorkers.map((worker) => (
                                                <View key={worker.id} style={[styles.workerBadge, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                                                    <View style={[styles.badgeAvatar, { backgroundColor: theme.colors.primaryBg }]}>
                                                        <Text style={{ color: theme.colors.primary, fontWeight: 'bold', fontSize: 12 }}>{worker.name?.charAt(0)}</Text>
                                                        <View style={styles.onlineIndicator} />
                                                    </View>
                                                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: '500' }}>{worker.name?.split(' ')[0]}</Text>
                                                </View>
                                            ))}
                                        </ScrollView>
                                    </View>
                                )}

                                {/* Navigation Grid */}
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Menu</Text>
                                    <View style={styles.navGrid}>
                                        {navItems.map((item) => {
                                            const IconComponent = item.icon;
                                            return (
                                                <View key={item.id} style={styles.navItemWrapper}>
                                                    <GlassCard
                                                        theme={theme}
                                                        onPress={() => handleNavPress(item.route)}
                                                        style={styles.navActionCard}
                                                    >
                                                        <IconComponent size={32} color={item.color} />
                                                        <Text style={[styles.navActionLabel, { color: theme.colors.text }]}>{item.title}</Text>
                                                    </GlassCard>
                                                </View>
                                            );
                                        })}
                                    </View>
                                </View>

                                {/* Quick Actions */}
                                <View style={styles.section}>
                                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Quick Actions</Text>
                                    <View style={styles.quickActions}>
                                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 8 }} onPress={() => navigation.navigate('CreateJob')}>
                                            <View style={{ padding: 12, borderRadius: 12, backgroundColor: theme.colors.cyanBg }}>
                                                <PlusCircle size={28} color="#06b6d4" />
                                            </View>
                                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{t('navigation.createJob')}</Text>
                                        </GlassCard>

                                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 8 }} onPress={() => navigation.navigate('UserManagement', { openCreate: true })}>
                                            <View style={{ padding: 12, borderRadius: 12, backgroundColor: theme.colors.pinkBg }}>
                                                <UserPlus size={28} color="#ec4899" />
                                            </View>
                                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{t('navigation.userManagement')}</Text>
                                        </GlassCard>

                                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 8 }} onPress={() => navigation.navigate('CustomerManagement', { openCreate: true })}>
                                            <View style={{ padding: 12, borderRadius: 12, backgroundColor: theme.colors.tealBg }}>
                                                <Building2 size={28} color="#14b8a6" />
                                            </View>
                                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>{t('navigation.customers')}</Text>
                                        </GlassCard>
                                    </View>
                                </View>

                                {/* List Header Section Title */}
                                <View style={[styles.section, { paddingBottom: 0 }]}>
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Text style={[styles.sectionTitle, { color: theme.colors.text, marginBottom: 0 }]}>{t('admin.recentJobs') || 'Recent Jobs'}</Text>
                                        <TouchableOpacity onPress={() => navigation.navigate('Jobs')}>
                                            <Text style={{ fontSize: 12, fontWeight: '600', color: theme.colors.primary }}>{t('common.all') || 'All'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        </>
                    }
                    renderItem={({ item }) => (
                        <View style={{ paddingHorizontal: 16, marginBottom: 8 }}>
                            <TouchableOpacity
                                style={{
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    padding: 12,
                                    borderRadius: 12,
                                    borderWidth: 1,
                                    backgroundColor: theme.colors.card,
                                    borderColor: theme.colors.cardBorder
                                }}
                                onPress={() => navigation.navigate('JobDetail', { jobId: item.id })}
                            >
                                <View style={{
                                    width: 36,
                                    height: 36,
                                    borderRadius: 18,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: 12,
                                    backgroundColor: theme.colors.primaryBg
                                }}>
                                    <Briefcase size={20} color={theme.colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 14, fontWeight: '600', marginBottom: 2, color: theme.colors.text }} numberOfLines={1}>
                                        {item.customer?.company ? `${item.customer.company} - ` : ''}{item.title}
                                    </Text>
                                    <Text style={{ fontSize: 12, color: theme.colors.subText }}>
                                        {item.status} • {new Date(item.createdAt).toLocaleDateString('tr-TR')}
                                    </Text>
                                </View>
                                <ChevronRight size={20} color={theme.colors.subText} />
                            </TouchableOpacity>
                        </View>
                    )}
                    ListEmptyComponent={
                        <View style={{ padding: 16, alignItems: 'center' }}>
                            <Text style={{ color: theme.colors.subText, fontStyle: 'italic' }}>{t('admin.noJobs') || 'No jobs found.'}</Text>
                        </View>
                    }
                />

                <DashboardBottomNav navigation={navigation} />
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80,
    },
    headerContainer: {
        padding: 20,
        paddingTop: 24,
        paddingBottom: 24,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    userInfo: {
        gap: 4,
    },
    welcomeLabel: {
        fontSize: 14,
        fontWeight: '500',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: -0.5,
    },
    profileButton: {
        padding: 4,
    },
    iconButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    mainContent: {
        flex: 1,
        zIndex: 2,
    },
    section: {
        padding: 16,
        paddingTop: 4,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    navGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    navItemWrapper: {
        width: '50%',
        padding: 6,
    },
    navActionCard: {
        height: 110,
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        padding: 16,
    },
    navActionLabel: {
        fontSize: 14,
        fontWeight: '600',
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
    chartContainer: {
        padding: 20,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
    },
    workerBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        paddingRight: 16,
        borderRadius: 100,
        borderWidth: 1,
        gap: 10,
    },
    badgeAvatar: {
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    onlineIndicator: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#22c55e',
        borderWidth: 2,
        borderColor: '#fff',
    },
});