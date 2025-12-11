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
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => setIsDrawerOpen(true)}
                        >
                            <MaterialIcons name="menu" size={28} color={COLORS.primary} />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.welcomeText}>Tekrar Hoşgeldiniz,</Text>
                            <Text style={styles.userName}>{user?.name || 'Admin Kullanıcı'}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
                            <MaterialIcons name="notifications" size={24} color={COLORS.primary} />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                    </View>
                </View>

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
        paddingBottom: 120, // Increased padding
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        paddingTop: 20,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    menuButton: {
        padding: 4,
    },
    welcomeText: {
        fontSize: 14,
        color: COLORS.slate400,
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    notificationButton: {
        padding: 8,
        position: 'relative',
        backgroundColor: COLORS.slate800,
        borderRadius: 20,
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
        borderWidth: 2,
        borderColor: COLORS.backgroundDark,
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
        width: '33.33%',
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
