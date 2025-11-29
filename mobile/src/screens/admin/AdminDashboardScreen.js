import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import notificationService from '../../services/notification.service';
import { useAuth } from '../../context/AuthContext';
import NotificationBadge from '../../components/NotificationBadge';

export default function AdminDashboardScreen({ navigation }) {
    const { logout } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    const loadNotifications = async () => {
        try {
            // const notifications = await notificationService.getNotifications();
            // const unread = notifications.filter(n => !n.isRead).length;
            // setUnreadCount(unread);
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const handleLogout = async () => {
        await logout();
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Admin Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Sistem Yönetimi ⚙️</Text>
                </View>
                <View style={styles.headerButtons}>
                    <NotificationBadge
                        onPress={() => navigation.navigate('Notifications')}
                        color="#000"
                    />
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Profile')}>
                        <Text style={styles.headerButtonIcon}>⚙️</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <Text style={styles.logoutIcon}>🚪</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* System Stats */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: '#EBF5FF' }]}>
                    <Text style={styles.statNumber}>24</Text>
                    <Text style={styles.statLabel}>Toplam Kullanıcı</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={[styles.statNumber, { color: '#2563EB' }]}>156</Text>
                    <Text style={styles.statLabel}>Toplam İş</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.statNumber, { color: '#059669' }]}>✓</Text>
                    <Text style={styles.statLabel}>Sistem Sağlığı</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.statNumber, { color: '#D97706' }]}>3</Text>
                    <Text style={styles.statLabel}>Bekleyen Onay</Text>
                </View>
            </View>

            {/* Coming Soon Section */}
            <View style={styles.comingSoonContainer}>
                <Text style={styles.comingSoonIcon}>🚀</Text>
                <Text style={styles.comingSoonTitle}>Daha Fazla Özellik Yakında!</Text>
                <Text style={styles.comingSoonText}>
                    Şu anda kullanılabilir özellikler:
                </Text>
                <View style={styles.featureList}>
                    <Text style={styles.featureItemActive}>✓ Kullanıcı yönetimi (CRUD)</Text>
                    <Text style={styles.featureItemActive}>✓ Müşteri şirket yönetimi</Text>
                    <Text style={styles.featureItem}>• Rol ve yetki yönetimi</Text>
                    <Text style={styles.featureItem}>• Sistem ayarları</Text>
                    <Text style={styles.featureItem}>• İş şablonları oluşturma</Text>
                    <Text style={styles.featureItem}>• Detaylı log ve raporlar</Text>
                </View>
            </View>

            {/* Admin Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Yönetim İşlemleri</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionButtonActive}
                        onPress={() => navigation.navigate('UserManagement')}
                    >
                        <Text style={styles.actionIcon}>👤</Text>
                        <Text style={styles.actionText}>Kullanıcılar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonActive}
                        onPress={() => navigation.navigate('CustomerManagement')}
                    >
                        <Text style={styles.actionIcon}>🏢</Text>
                        <Text style={styles.actionText}>Müşteriler</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.quickActions, { marginTop: 12 }]}>
                    <TouchableOpacity
                        style={styles.actionButtonActive}
                        onPress={() => navigation.navigate('WorkerJobs')}
                    >
                        <Text style={styles.actionIcon}>📋</Text>
                        <Text style={styles.actionText}>İş Yönetimi</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonActive}
                        onPress={() => navigation.navigate('CostManagement')}
                    >
                        <Text style={styles.actionIcon}>💰</Text>
                        <Text style={styles.actionText}>Masraflar</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.quickActions, { marginTop: 12 }]}>
                    <TouchableOpacity style={styles.actionButton} disabled>
                        <Text style={styles.actionIcon}>⚙️</Text>
                        <Text style={styles.actionText}>Ayarlar</Text>
                        <Text style={styles.comingSoonBadge}>Yakında</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 1, marginRight: 8 }} />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    header: {
        backgroundColor: '#fff',
        padding: 20,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#6B7280',
    },
    headerButtons: {
        flexDirection: 'row',
    },
    headerButton: {
        padding: 8,
        marginRight: 8,
    },
    headerButtonIcon: {
        fontSize: 24,
    },
    logoutButton: {
        padding: 8,
    },
    logoutIcon: {
        fontSize: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 16,
    },
    statCard: {
        flex: 1,
        minWidth: '45%',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        margin: 6,
    },
    statNumber: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: '#6B7280',
    },
    comingSoonContainer: {
        margin: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    comingSoonIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    comingSoonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    comingSoonText: {
        fontSize: 16,
        color: '#6B7280',
        marginBottom: 16,
        textAlign: 'center',
    },
    featureList: {
        alignSelf: 'stretch',
        paddingHorizontal: 20,
    },
    featureItem: {
        fontSize: 14,
        color: '#6B7280',
        marginBottom: 8,
    },
    featureItemActive: {
        fontSize: 14,
        color: '#16A34A',
        marginBottom: 8,
        fontWeight: '600',
    },
    section: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 12,
    },
    quickActions: {
        flexDirection: 'row',
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        opacity: 0.6,
        marginRight: 8,
    },
    actionButtonActive: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        marginRight: 8,
    },
    actionIcon: {
        fontSize: 32,
        marginBottom: 8,
    },
    actionText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#111827',
        marginBottom: 4,
    },
    comingSoonBadge: {
        fontSize: 10,
        color: '#F59E0B',
        fontWeight: '600',
    },
    badge: {
        position: 'absolute',
        top: 0,
        right: 0,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#EF4444',
        borderWidth: 1,
        borderColor: '#fff',
    },
});
