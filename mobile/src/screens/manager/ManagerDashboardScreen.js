import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuth } from '../../context/AuthContext';
import NotificationBadge from '../../components/NotificationBadge';
import { COLORS } from '../../constants/theme';
import StatCard from '../../components/StatCard';
import DashboardAction from '../../components/DashboardAction';

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
                        color={COLORS.white}
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
                <StatCard
                    label="Ekip Üyeleri"
                    value="8"
                    icon="group"
                    iconColor={COLORS.black}
                    backgroundColor="#EBF5FF"
                    style={{ margin: 6 }}
                />
                <StatCard
                    label="Aktif İşler"
                    value="12"
                    icon="assignment"
                    iconColor="#2563EB"
                    backgroundColor="#DBEAFE"
                    style={{ margin: 6 }}
                />
            </View>
            <View style={styles.statsContainer}>
                <StatCard
                    label="Onay Bekleyen"
                    value="5"
                    icon="pending-actions"
                    iconColor="#D97706"
                    backgroundColor="#FEF3C7"
                    style={{ margin: 6 }}
                />
                <StatCard
                    label="Tamamlanma"
                    value="87%"
                    icon="check-circle"
                    iconColor="#059669"
                    backgroundColor="#D1FAE5"
                    style={{ margin: 6 }}
                />
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
                    <DashboardAction
                        label="Ekibim"
                        icon="👥"
                        onPress={() => navigation.navigate('TeamList')}
                        isActive={true}
                    />
                    <DashboardAction
                        label="İş Atama"
                        icon="📋"
                        onPress={() => navigation.navigate('JobAssignment')}
                        isActive={true}
                    />
                </View>
                <View style={[styles.quickActions, { marginTop: 12 }]}>
                    <DashboardAction
                        label="Masraflar"
                        icon="💰"
                        onPress={() => navigation.navigate('CostManagement')}
                        isActive={true}
                    />
                    <DashboardAction
                        label="Raporlar"
                        icon="📊"
                        isActive={false}
                        disabled={true}
                        comingSoon={true}
                    />
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.backgroundDark,
    },
    header: {
        backgroundColor: COLORS.cardDark,
        padding: 20,
        paddingTop: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
        color: COLORS.slate400,
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
        color: COLORS.white,
    },
    logoutButton: {
        padding: 8,
    },
    logoutIcon: {
        fontSize: 24,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    comingSoonContainer: {
        margin: 16,
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        borderWidth: 1,
        borderColor: '#333',
    },
    comingSoonIcon: {
        fontSize: 64,
        marginBottom: 16,
    },
    comingSoonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 12,
    },
    comingSoonText: {
        fontSize: 16,
        color: COLORS.slate400,
        marginBottom: 16,
        textAlign: 'center',
    },
    featureList: {
        alignSelf: 'stretch',
        paddingHorizontal: 20,
    },
    featureItem: {
        fontSize: 14,
        color: COLORS.slate400,
        marginBottom: 8,
    },
    featureItemActive: {
        fontSize: 14,
        color: COLORS.primary,
        marginBottom: 8,
        fontWeight: '600',
    },
    section: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 12,
    },
    quickActions: {
        flexDirection: 'row',
    },
});
