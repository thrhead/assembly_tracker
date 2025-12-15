import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import DashboardAction from '../../components/DashboardAction';
import { COLORS } from '../../constants/theme';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import CustomDrawer from '../../components/admin/CustomDrawer';
import DashboardStatsGrid from '../../components/admin/DashboardStatsGrid';
import RecentJobsList from '../../components/admin/RecentJobsList';
import DashboardBottomNav from '../../components/admin/DashboardBottomNav';

export default function AdminDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
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

    // Navigation Items Data
    const navItems = [
        { id: 'users', title: 'Kullanıcılar', icon: 'people', route: 'UserManagement', color: COLORS.blue500 },
        { id: 'customers', title: 'Müşteriler', icon: 'business', route: 'CustomerManagement', color: COLORS.purple500 },
        { id: 'teams', title: 'Ekipler', icon: 'groups', route: 'TeamList', color: COLORS.indigo500 },
        { id: 'jobs', title: 'İşler', icon: 'work', route: 'Jobs', color: COLORS.orange500 },
        { id: 'approvals', title: 'Onaylar', icon: 'fact-check', route: 'Approvals', color: COLORS.teal500 },
        { id: 'costs', title: 'Maliyetler', icon: 'attach-money', route: 'CostManagement', color: COLORS.green500 },
        { id: 'calendar', title: 'Takvim', icon: 'calendar-today', route: 'Calendar', color: COLORS.purple500 },
    ];

    const handleNavPress = (route) => {
        setIsDrawerOpen(false);
        navigation.navigate(route);
    };

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            <CustomDrawer
                visible={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                user={user}
                navItems={navItems}
                onNavigate={handleNavPress}
                onLogout={logout}
            />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
            >
                {/* Header Container */}
                <View style={styles.headerContainer}>
                    <View style={styles.headerContent}>
                        <View style={styles.userInfo}>
                            <Text style={styles.welcomeLabel}>Hoşgeldiniz,</Text>
                            <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.profileButton}
                            onPress={() => navigation.navigate('Profile')}
                        >
                            <View style={styles.avatarCircle}>
                                <Text style={styles.avatarText}>
                                    {user?.name?.charAt(0) || 'A'}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {/* Stats Summary Row if needed, or just spacing */}
                </View>

                {/* Main Content Container - overlaps header slightly for depth if we add negative margin, 
                    but for now keeping clean flow */}
                <View style={styles.mainContent}>

                    {/* Stats Grid */}
                    <DashboardStatsGrid statsData={statsData} />

                    {/* Navigation Grid */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Menü</Text>
                        <View style={styles.navGrid}>
                            {navItems.map((item) => (
                                <View key={item.id} style={styles.navItemWrapper}>
                                    <DashboardAction
                                        label={item.title}
                                        icon={<MaterialIcons name={item.icon} size={32} color={item.color} />}
                                        onPress={() => handleNavPress(item.route)}
                                        isActive={true}
                                        style={styles.navAction}
                                    />
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Quick Actions */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
                        <View style={styles.quickActions}>
                            <DashboardAction
                                label="Yeni İş"
                                icon={<MaterialIcons name="add-task" size={32} color={COLORS.cyan500} />}
                                onPress={() => navigation.navigate('CreateJob')}
                                style={{ flex: 1 }}
                            />
                            <DashboardAction
                                label="Yeni Kullanıcı"
                                icon={<MaterialIcons name="person-add" size={32} color={COLORS.pink500} />}
                                onPress={() => navigation.navigate('UserManagement', { openCreate: true })}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>

                    {/* Recent Jobs */}
                    <RecentJobsList
                        jobs={recentJobs}
                        onJobPress={(id) => navigation.navigate('JobDetail', { jobId: id })}
                        onViewAll={() => navigation.navigate('Jobs')}
                    />

                </View>
            </ScrollView>

            <DashboardBottomNav navigation={navigation} />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    headerContainer: {
        padding: 20,
        paddingTop: 24,
        paddingBottom: 32,
        backgroundColor: COLORS.cardDark,
        borderBottomLeftRadius: 24,
        borderBottomRightRadius: 24,
        marginBottom: -24, // Overlap effect
        zIndex: 1,
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
        color: COLORS.slate400,
        fontWeight: '500',
    },
    userName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        letterSpacing: -0.5,
    },
    profileButton: {
        padding: 4,
    },
    avatarCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255,255,255,0.1)',
        shadowColor: COLORS.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.backgroundDark,
    },
    mainContent: {
        flex: 1,
        zIndex: 2,
        paddingTop: 12, // Space after overlap
    },
    section: {
        padding: 16,
        paddingTop: 4,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: COLORS.textLight,
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
    navAction: {
        height: 100,
        justifyContent: 'center',
        backgroundColor: COLORS.cardDark,
        borderColor: COLORS.slate800,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
});
