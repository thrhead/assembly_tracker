import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import DashboardAction from '../../components/DashboardAction';
import { COLORS } from '../../constants/theme';

import api from '../../services/api';

const { width } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [statsData, setStatsData] = useState({
        totalJobs: 0,
        activeTeams: 0,
        completedJobs: 0,
        pendingJobs: 0
    });

    const fetchStats = async () => {
        try {
            const response = await api.get('/admin/stats');
            setStatsData(response.data);
        } catch (error) {
            console.error('Error fetching admin stats:', error);
        }
    };

    useFocusEffect(
        useCallback(() => {
            fetchStats();
        }, [])
    );

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
        { id: 'jobs', title: 'İşler', icon: 'work', route: 'JobAssignment', color: COLORS.orange500 },
        { id: 'approvals', title: 'Onaylar', icon: 'fact-check', route: 'Approvals', color: COLORS.teal500 },
        { id: 'costs', title: 'Maliyetler', icon: 'attach-money', route: 'CostManagement', color: COLORS.green500 },
        { id: 'calendar', title: 'Takvim', icon: 'calendar-today', route: 'Calendar', color: COLORS.purple500 },
    ];

    // Real data from API
    const stats = [
        {
            title: 'Toplam İş',
            value: (statsData?.totalJobs || 0).toString(),
            icon: 'work',
            color: COLORS.primary,
        },
        {
            title: 'Aktif Ekipler',
            value: (statsData?.activeTeams || 0).toString(),
            icon: 'groups',
            color: COLORS.blue500,
        },
        {
            title: 'Tamamlanan',
            value: (statsData?.completedJobs || 0).toString(),
            icon: 'check-circle',
            color: COLORS.green500,
        },
        {
            title: 'Bekleyen',
            value: (statsData?.pendingJobs || 0).toString(),
            icon: 'access-time',
            color: COLORS.amber500,
        }
    ];

    const handleNavPress = (route) => {
        setIsDrawerOpen(false);
        navigation.navigate(route);
    };

    const renderDrawer = () => (
        <Modal
            animationType="fade"
            transparent={true}
            visible={isDrawerOpen}
            onRequestClose={() => setIsDrawerOpen(false)}
        >
            <TouchableOpacity
                style={styles.modalOverlay}
                activeOpacity={1}
                onPress={() => setIsDrawerOpen(false)}
            >
                <View style={styles.drawerContainer}>
                    <View style={styles.drawerHeader}>
                        <View style={styles.drawerAvatarContainer}>
                            <Text style={styles.drawerAvatarText}>
                                {user?.name ? user.name.charAt(0).toUpperCase() : 'A'}
                            </Text>
                        </View>
                        <Text style={styles.drawerName}>{user?.name || 'Admin'}</Text>
                        <Text style={styles.drawerRole}>Yönetici</Text>
                    </View>
                    <View style={styles.drawerItems}>
                        {navItems.map((item) => (
                            <TouchableOpacity
                                key={item.id}
                                style={styles.drawerItem}
                                onPress={() => handleNavPress(item.route)}
                            >
                                <MaterialIcons name={item.icon} size={24} color={item.color} />
                                <Text style={styles.drawerItemText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <MaterialIcons name="logout" size={24} color={COLORS.red500} />
                        <Text style={styles.logoutText}>Çıkış Yap</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container} edges={['left', 'right', 'bottom']}>
            {renderDrawer()}
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
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Genel Durum</Text>
                    <View style={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <StatCard
                                key={index}
                                label={stat.title}
                                value={stat.value}
                                icon={stat.icon}
                                iconColor={stat.color}
                                style={styles.statCard}
                            />
                        ))}
                    </View>
                </View>

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
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Son İşler</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('JobAssignment')}>
                            <Text style={styles.seeAllText}>Tümünü Gör</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.recentList}>
                        <TouchableOpacity style={styles.recentItem} onPress={() => navigation.navigate('JobAssignment')}>
                            <View style={styles.recentIcon}>
                                <MaterialIcons name="work" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.recentInfo}>
                                <Text style={styles.recentTitle}>Klima Montajı - A Blok</Text>
                                <Text style={styles.recentSubtitle}>Ahmet Yılmaz • 2 saat önce</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color={COLORS.slate600} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.recentItem} onPress={() => navigation.navigate('JobAssignment')}>
                            <View style={styles.recentIcon}>
                                <MaterialIcons name="work" size={20} color={COLORS.primary} />
                            </View>
                            <View style={styles.recentInfo}>
                                <Text style={styles.recentTitle}>Arıza Tespit - B Blok</Text>
                                <Text style={styles.recentSubtitle}>Mehmet Demir • 5 saat önce</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color={COLORS.slate600} />
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => { }}>
                    <MaterialIcons name="dashboard" size={24} color={COLORS.primary} />
                    <Text style={[styles.navText, { color: COLORS.primary }]}>Panel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('TeamList')}>
                    <MaterialIcons name="group" size={24} color={COLORS.slate400} />
                    <Text style={styles.navText}>Ekip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('JobAssignment')}>
                    <MaterialIcons name="list-alt" size={24} color={COLORS.slate400} />
                    <Text style={styles.navText}>Görevler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <MaterialIcons name="settings" size={24} color={COLORS.slate400} />
                    <Text style={styles.navText}>Ayarlar</Text>
                </TouchableOpacity>
            </View>
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
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        width: '48%',
        marginBottom: 0,
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
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAllText: {
        color: COLORS.primary,
        fontSize: 12,
        fontWeight: '600',
    },
    recentList: {
        gap: 8,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    recentIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(204, 255, 4, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    recentInfo: {
        flex: 1,
    },
    recentTitle: {
        color: COLORS.textLight,
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    recentSubtitle: {
        color: COLORS.slate400,
        fontSize: 12,
    },
    bottomNav: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-around',
        backgroundColor: 'rgba(1, 1, 0, 0.95)',
        borderTopWidth: 1,
        borderTopColor: COLORS.slate800,
        paddingVertical: 8,
        paddingBottom: 20,
    },
    navItem: {
        alignItems: 'center',
        gap: 4,
        padding: 8,
    },
    navText: {
        fontSize: 10,
        fontWeight: '500',
        color: COLORS.slate400,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
    },
    drawerContainer: {
        width: '70%',
        height: '100%',
        backgroundColor: COLORS.cardDark,
        padding: 20,
        paddingTop: 50,
        borderRightWidth: 1,
        borderRightColor: COLORS.slate800,
    },
    drawerHeader: {
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.slate800,
        paddingBottom: 20,
    },
    drawerAvatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.slate800,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    drawerAvatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: COLORS.primary,
    },
    drawerName: {
        color: COLORS.textLight,
        fontSize: 18,
        fontWeight: 'bold',
    },
    drawerRole: {
        color: COLORS.primary,
        fontSize: 14,
    },
    drawerItems: {
        gap: 8,
    },
    drawerItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 16,
    },
    drawerItemText: {
        color: COLORS.textLight,
        fontSize: 16,
        fontWeight: '500',
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        marginTop: 'auto',
        gap: 16,
        borderTopWidth: 1,
        borderTopColor: COLORS.slate800,
        paddingTop: 20,
    },
    logoutText: {
        color: COLORS.red500,
        fontSize: 16,
        fontWeight: '600',
    },
});
