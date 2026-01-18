import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, StatusBar, Alert, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../../components/ui/GlassCard';
import { useDashboardStats } from '../../hooks/useDashboardStats';
import CustomDrawer from '../../components/admin/CustomDrawer';
import DashboardStatsGrid from '../../components/admin/DashboardStatsGrid'; // You might need to check if this component supports theme props or styling
import RecentJobsList from '../../components/admin/RecentJobsList'; // Same here
import DashboardBottomNav from '../../components/admin/DashboardBottomNav';

export default function AdminDashboardScreen({ navigation }) {
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

    const handleLogout = async () => {
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
    };

    // Navigation Items Data
    const navItems = [
        { id: 'users', title: 'Kullanıcılar', icon: 'people', route: 'UserManagement', color: theme.colors.primary },
        { id: 'customers', title: 'Müşteriler', icon: 'business', route: 'CustomerManagement', color: theme.colors.tertiary },
        { id: 'teams', title: 'Ekipler', icon: 'groups', route: 'TeamList', color: theme.colors.secondary },
        { id: 'jobs', title: 'İşler', icon: 'work', route: 'Jobs', color: '#f97316' }, // Orange
        { id: 'approvals', title: 'Onaylar', icon: 'fact-check', route: 'Approvals', color: '#14b8a6' }, // Teal
        { id: 'costs', title: 'Maliyetler', icon: 'attach-money', route: 'CostManagement', color: '#22c55e' }, // Green
        { id: 'calendar', title: 'Takvim', icon: 'calendar-today', route: 'Calendar', color: '#a855f7' }, // Purple
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

                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Container */}
                    <View style={styles.headerContainer}>
                        <View style={styles.headerContent}>
                            <View style={styles.userInfo}>
                                <Text style={[styles.welcomeLabel, { color: theme.colors.subText }]}>Hoşgeldiniz,</Text>
                                <Text style={[styles.userName, { color: theme.colors.text }]}>{user?.name || 'Admin'}</Text>
                            </View>

                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                <TouchableOpacity
                                    style={[styles.iconButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                                    onPress={toggleTheme}
                                >
                                    <MaterialIcons name={isDark ? "light-mode" : "dark-mode"} size={24} color={theme.colors.icon} />
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

                        {/* Recent Jobs wrapped in a view purely for layout order if needed, but keeping original order */}
                        <DashboardStatsGrid statsData={statsData} />

                        {/* Navigation Grid */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Menü</Text>
                            <View style={styles.navGrid}>
                                {navItems.map((item) => (
                                    <View key={item.id} style={styles.navItemWrapper}>
                                        <GlassCard
                                            theme={theme}
                                            onPress={() => handleNavPress(item.route)}
                                            style={styles.navActionCard}
                                        >
                                            <MaterialIcons name={item.icon} size={32} color={item.color} />
                                            <Text style={[styles.navActionLabel, { color: theme.colors.text }]}>{item.title}</Text>
                                        </GlassCard>
                                    </View>
                                ))}
                            </View>
                        </View>

                        {/* Quick Actions */}
                        <View style={styles.section}>
                            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Hızlı İşlemler</Text>
                            <View style={styles.quickActions}>
                                <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 8 }} onPress={() => navigation.navigate('CreateJob')}>
                                    <View style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
                                        <MaterialIcons name="add-task" size={28} color="#06b6d4" />
                                    </View>
                                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Yeni İş</Text>
                                </GlassCard>

                                <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 8 }} onPress={() => navigation.navigate('UserManagement', { openCreate: true })}>
                                    <View style={{ padding: 12, borderRadius: 12, backgroundColor: 'rgba(236, 72, 153, 0.1)' }}>
                                        <MaterialIcons name="person-add" size={28} color="#ec4899" />
                                    </View>
                                    <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Yeni Kullanıcı</Text>
                                </GlassCard>
                            </View>
                        </View>

                        <RecentJobsList
                            jobs={recentJobs}
                            onJobPress={(id) => navigation.navigate('JobDetail', { jobId: id })}
                            onViewAll={() => navigation.navigate('Jobs')}
                        />

                    </View>
                </ScrollView>

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
        paddingBottom: 120,
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
});
