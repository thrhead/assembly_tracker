import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import NotificationBadge from '../../components/NotificationBadge';

export default function ManagerDashboardScreen({ navigation }) {
    const { logout } = useAuth();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <ScrollView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Manager Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Ekip Yönetimi 👨‍💼</Text>
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

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <View style={[styles.statCard, { backgroundColor: '#EBF5FF' }]}>
                    <Text style={styles.statNumber}>8</Text>
                    <Text style={styles.statLabel}>Ekip Üyeleri</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#DBEAFE' }]}>
                    <Text style={[styles.statNumber, { color: '#2563EB' }]}>12</Text>
                    <Text style={styles.statLabel}>Aktif İşler</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.statNumber, { color: '#D97706' }]}>5</Text>
                    <Text style={styles.statLabel}>Onay Bekleyen</Text>
                </View>
                <View style={[styles.statCard, { backgroundColor: '#D1FAE5' }]}>
                    <Text style={[styles.statNumber, { color: '#059669' }]}>87%</Text>
                    <Text style={styles.statLabel}>Tamamlanma</Text>
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
                    <Text style={styles.featureItemActive}>✓ Ekip performans görüntüleme</Text>
                    <Text style={styles.featureItemActive}>✓ İş atama ve yönetimi</Text>
                    <Text style={styles.featureItem}>• Onay bekleyen işlemler</Text>
                    <Text style={styles.featureItem}>• Müşteri yönetimi</Text>
                    <Text style={styles.featureItem}>• Detaylı istatistikler</Text>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
                <View style={styles.quickActions}>
                    <TouchableOpacity
                        style={styles.actionButtonActive}
                        onPress={() => navigation.navigate('TeamList')}
                    >
                        <Text style={styles.actionIcon}>👥</Text>
                        <Text style={styles.actionText}>Ekibim</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.actionButtonActive}
                        onPress={() => navigation.navigate('JobAssignment')}
                    >
                        <Text style={styles.actionIcon}>📋</Text>
                        <Text style={styles.actionText}>İş Atama</Text>
                    </TouchableOpacity>
                </View>
                <View style={[styles.quickActions, { marginTop: 12 }]}>
                    <TouchableOpacity
                        style={styles.actionButtonActive}
                        onPress={() => navigation.navigate('CostManagement')}
                    >
                        <Text style={styles.actionIcon}>💰</Text>
                        <Text style={styles.actionText}>Masraflar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.actionButton} disabled>
                        <Text style={styles.actionIcon}>📊</Text>
                        <Text style={styles.actionText}>Raporlar</Text>
                        <Text style={styles.comingSoonBadge}>Yakında</Text>
                    </TouchableOpacity>
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
});
