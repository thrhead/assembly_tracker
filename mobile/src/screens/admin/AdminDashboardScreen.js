import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Dimensions, Modal, SafeAreaView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const { width, height } = Dimensions.get('window');

export default function AdminDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Navigation Items Data
    const navItems = [
        { id: 'users', title: 'Kullanıcılar', icon: 'people', route: 'UserManagement', color: '#CCFF04' },
        { id: 'customers', title: 'Müşteriler', icon: 'business', route: 'CustomerManagement', color: '#CCFF04' },
        { id: 'teams', title: 'Ekipler', icon: 'groups', route: 'TeamList', color: '#CCFF04' },
        { id: 'jobs', title: 'İşler', icon: 'work', route: 'JobAssignment', color: '#CCFF04' },
        { id: 'approvals', title: 'Onaylar', icon: 'fact-check', route: 'Approvals', color: '#CCFF04' },
        { id: 'costs', title: 'Maliyetler', icon: 'attach-money', route: 'CostManagement', color: '#CCFF04' },
    ];

    // Mock data matching Web Dashboard Stats
    const stats = [
        {
            title: 'Toplam İş',
            value: '124',
            change: 'Tüm zamanlar',
            icon: 'work',
            color: '#CCFF04',
            bg: '#1A1A1A'
        },
        {
            title: 'Aktif Ekipler',
            value: '8',
            change: 'Aktif',
            icon: 'groups',
            color: '#CCFF04',
            bg: '#1A1A1A'
        },
        {
            title: 'Tamamlanan',
            value: '12',
            change: 'Bu ay',
            icon: 'check-circle',
            color: '#CCFF04',
            bg: '#1A1A1A'
        },
        {
            title: 'Bekleyen Onay',
            value: '3',
            change: 'Acil',
            icon: 'access-time',
            color: '#FFA500', // Orange for urgency
            bg: '#1A1A1A'
        }
    ];

    useFocusEffect(
        useCallback(() => {
            // Load notifications logic here
        }, [])
    );

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
                        <Image
                            source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDmgIPsi3bPD34q9YUmIJBghzDzdjJ1rgdx1tBy10ynTsLKppEU00n7doTCFEiJdlPmoV_1BkGez8XvuImrIDFnxuqU91lP4ldNTWXjv8i-HqXYQEbOCatNc0kgwrtg5_Qm9w28VRd3Mszc19FPohh87hQImoPk0OPOj9_4PnMcxA8og88y5Uf3GyDt6qLEsXq8LHL_V3hdFx5i2I3UZqsoRVnXw8sDaQIBRNOjOJCQEVxvFwKvsLg_SvV-dnsZe7gFaAK-JaS1DM5y' }}
                            style={styles.drawerAvatar}
                        />
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
                                <MaterialIcons name={item.icon} size={24} color="#CCFF04" />
                                <Text style={styles.drawerItemText}>{item.title}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity style={styles.logoutButton} onPress={logout}>
                        <MaterialIcons name="logout" size={24} color="#ff4444" />
                        <Text style={styles.logoutText}>Çıkış Yap</Text>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        </Modal>
    );

    return (
        <View style={styles.container}>
            {renderDrawer()}
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerLeft}>
                        <TouchableOpacity
                            style={styles.menuButton}
                            onPress={() => setIsDrawerOpen(true)}
                        >
                            <MaterialIcons name="menu" size={28} color="#ffffff" />
                        </TouchableOpacity>
                        <View>
                            <Text style={styles.welcomeText}>Tekrar Hoşgeldiniz,</Text>
                            <Text style={styles.userName}>{user?.name || 'Admin Kullanıcı'}</Text>
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity style={styles.notificationButton} onPress={() => navigation.navigate('Notifications')}>
                            <MaterialIcons name="notifications" size={24} color="#e2e8f0" />
                            <View style={styles.notificationBadge} />
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.notificationButton, { backgroundColor: 'rgba(255, 68, 68, 0.1)' }]} onPress={logout}>
                            <MaterialIcons name="logout" size={24} color="#ff4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Navigation Grid */}
                <View style={styles.navGrid}>
                    {navItems.map((item) => (
                        <TouchableOpacity
                            key={item.id}
                            style={styles.navCard}
                            onPress={() => handleNavPress(item.route)}
                        >
                            <View style={styles.navIconContainer}>
                                <MaterialIcons name={item.icon} size={32} color="#000000" />
                            </View>
                            <Text style={styles.navTitle}>{item.title}</Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Stats Grid */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Genel Durum</Text>
                    <View style={styles.statsGrid}>
                        {stats.map((stat, index) => (
                            <View key={index} style={styles.statCard}>
                                <View style={styles.statHeader}>
                                    <Text style={styles.statTitle}>{stat.title}</Text>
                                    <MaterialIcons name={stat.icon} size={20} color={stat.color} />
                                </View>
                                <Text style={styles.statValue}>{stat.value}</Text>
                                <Text style={styles.statChange}>{stat.change}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Hızlı İşlemler</Text>
                    <View style={styles.quickActions}>
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('WorkerJobs', { openCreate: true })}
                        >
                            <View style={[styles.actionIcon, { backgroundColor: 'rgba(57, 255, 20, 0.1)' }]}>
                                <MaterialIcons name="add-task" size={24} color="#CCFF04" />
                            </View>
                            <Text style={styles.actionText}>Yeni İş</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => navigation.navigate('UserManagement', { openCreate: true })}
                        >
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Recent Jobs */}
                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Son İşler</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('WorkerJobs')}>
                            <Text style={styles.seeAllText}>Tümünü Gör</Text>
                        </TouchableOpacity>
                    </View>
                    {/* We would ideally fetch real recent jobs here. For now, a static placeholder or passed prop */}
                    <View style={styles.recentList}>
                        <TouchableOpacity style={styles.recentItem} onPress={() => navigation.navigate('WorkerJobs')}>
                            <View style={styles.recentIcon}>
                                <MaterialIcons name="work" size={20} color="#CCFF04" />
                            </View>
                            <View style={styles.recentInfo}>
                                <Text style={styles.recentTitle}>Klima Montajı - A Blok</Text>
                                <Text style={styles.recentSubtitle}>Ahmet Yılmaz • 2 saat önce</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#64748b" />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.recentItem} onPress={() => navigation.navigate('WorkerJobs')}>
                            <View style={styles.recentIcon}>
                                <MaterialIcons name="work" size={20} color="#CCFF04" />
                            </View>
                            <View style={styles.recentInfo}>
                                <Text style={styles.recentTitle}>Arıza Tespit - B Blok</Text>
                                <Text style={styles.recentSubtitle}>Mehmet Demir • 5 saat önce</Text>
                            </View>
                            <MaterialIcons name="chevron-right" size={20} color="#64748b" />
                        </TouchableOpacity>
                    </View>
                </View>

            </ScrollView>

            {/* Bottom Navigation */}
            <View style={styles.bottomNav}>
                <TouchableOpacity style={styles.navItem} onPress={() => { }}>
                    <MaterialIcons name="dashboard" size={24} color="#CCFF04" />
                    <Text style={[styles.navText, { color: '#CCFF04' }]}>Panel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('TeamList')}>
                    <MaterialIcons name="group" size={24} color="#94a3b8" />
                    <Text style={styles.navText}>Ekip</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('WorkerJobs')}>
                    <MaterialIcons name="list-alt" size={24} color="#94a3b8" />
                    <Text style={styles.navText}>Görevler</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => { }}>
                    <MaterialIcons name="analytics" size={24} color="#94a3b8" />
                    <Text style={styles.navText}>Raporlar</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.navItem} onPress={() => navigation.navigate('Profile')}>
                    <MaterialIcons name="settings" size={24} color="#94a3b8" />
                    <Text style={styles.navText}>Ayarlar</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#010100',
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 80,
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
        color: '#94a3b8',
    },
    userName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    notificationButton: {
        padding: 8,
        position: 'relative',
        backgroundColor: '#1e293b',
        borderRadius: 20,
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#CCFF04',
        borderWidth: 2,
        borderColor: '#010100',
    },
    navGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 12,
        justifyContent: 'space-between', // Distribute space evenly
    },
    navCard: {
        width: '31%', // Fits 3 items with space between
        aspectRatio: 1.2, // Slightly shorter than square (1) to reduce vertical size
        backgroundColor: '#1A1A1A',
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#333',
        gap: 8,
        marginBottom: 12,
    },
    navIconContainer: {
        width: 40, // Slightly smaller icon container
        height: 40,
        borderRadius: 20,
        backgroundColor: '#CCFF04',
        alignItems: 'center',
        justifyContent: 'center',
    },
    navTitle: {
        color: '#ffffff',
        fontSize: 11, // Slightly smaller text
        fontWeight: '600',
        textAlign: 'center',
    },
    section: {
        padding: 16,
        paddingTop: 4, // Reduce top padding
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#ffffff',
        marginBottom: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    statCard: {
        width: '48%', // Fits 2 items with space
        backgroundColor: '#101010',
        borderRadius: 12,
        padding: 12, // Reduced padding
        borderWidth: 1,
        borderColor: '#2a2a2a',
        marginBottom: 12,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 6,
    },
    statTitle: {
        fontSize: 11,
        color: '#94a3b8',
        fontWeight: '500',
    },
    statValue: {
        fontSize: 20, // Slightly smaller
        fontWeight: 'bold',
        color: '#ffffff',
        marginBottom: 2,
    },
    statChange: {
        fontSize: 11,
        color: '#64748b',
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
        borderTopColor: '#2a2a2a',
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
        color: '#94a3b8',
    },
    // Drawer Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-start',
    },
    drawerContainer: {
        width: '70%',
        height: '100%',
        backgroundColor: '#1A1A1A',
        padding: 20,
        paddingTop: 50,
        borderRightWidth: 1,
        borderRightColor: '#333',
    },
    drawerHeader: {
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        paddingBottom: 20,
    },
    drawerAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#CCFF04',
    },
    drawerName: {
        color: '#ffffff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    drawerRole: {
        color: '#CCFF04',
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
        color: '#ffffff',
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
        borderTopColor: '#333',
        paddingTop: 20,
    },
    logoutText: {
        color: '#ff4444',
        fontSize: 16,
        fontWeight: '600',
    },
    // Quick Actions Styles
    quickActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#1A1A1A',
        borderRadius: 12,
        padding: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#333',
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
    },
    actionText: {
        color: '#ffffff',
        fontSize: 11,
        fontWeight: '600',
    },
    // Recent Jobs Styles
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    seeAllText: {
        color: '#CCFF04',
        fontSize: 12,
        fontWeight: '600',
    },
    recentList: {
        gap: 8,
    },
    recentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#1A1A1A',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#333',
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
        color: '#ffffff',
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 2,
    },
    recentSubtitle: {
        color: '#94a3b8',
        fontSize: 12,
    },
});
