import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
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
                    <Text style={styles.headerSubtitle}>Ekip Yönetimi</Text>
                </View>
                <View style={styles.headerButtons}>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Notifications')}>
                        <MaterialIcons name="notifications-none" size={24} color={COLORS.primary} />
                        <View style={styles.notificationBadge} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Profile')}>
                        <MaterialIcons name="settings" size={24} color={COLORS.primary} />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                        <MaterialIcons name="logout" size={24} color={COLORS.red500} />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Stats */}
            <View style={styles.statsContainer}>
                <StatCard
                    label="Ekip Üyeleri"
                    value="8"
                    icon="group"
                    iconColor={COLORS.primary}
                    style={{ flex: 1, margin: 6 }}
                />
                <StatCard
                    label="Aktif İşler"
                    value="12"
                    icon="assignment"
                    iconColor={COLORS.blue500}
                    style={{ flex: 1, margin: 6 }}
                />
            </View>
            <View style={styles.statsContainer}>
                <StatCard
                    label="Onay Bekleyen"
                    value="5"
                    icon="pending-actions"
                    iconColor={COLORS.amber500}
                    style={{ flex: 1, margin: 6 }}
                />
                <StatCard
                    label="Tamamlanma"
                    value="87%"
                    icon="check-circle"
                    iconColor={COLORS.green500}
                    style={{ flex: 1, margin: 6 }}
                />
            </View>

            {/* Coming Soon Section */}
            <View style={styles.comingSoonContainer}>
                <MaterialIcons name="rocket-launch" size={64} color={COLORS.primary} style={{ marginBottom: 16 }} />
                <Text style={styles.comingSoonTitle}>Daha Fazla Özellik Yakında!</Text>
                <Text style={styles.comingSoonText}>
                    Şu anda kullanılabilir özellikler:
                </Text>
                <View style={styles.featureList}>
                    <View style={styles.featureItemRow}>
                        <MaterialIcons name="check" size={16} color={COLORS.primary} />
                        <Text style={styles.featureItemActive}>Ekip performans görüntüleme</Text>
                    </View>
                    <View style={styles.featureItemRow}>
                        <MaterialIcons name="check" size={16} color={COLORS.primary} />
                        <Text style={styles.featureItemActive}>İş atama ve yönetimi</Text>
                    </View>
                    <View style={styles.featureItemRow}>
                        <MaterialIcons name="fiber-manual-record" size={8} color={COLORS.slate400} style={{ marginTop: 6 }} />
                        <Text style={styles.featureItem}>Onay bekleyen işlemler</Text>
                    </View>
                    <View style={styles.featureItemRow}>
                        <MaterialIcons name="fiber-manual-record" size={8} color={COLORS.slate400} style={{ marginTop: 6 }} />
                        <Text style={styles.featureItem}>Müşteri yönetimi</Text>
                    </View>
                    <View style={styles.featureItemRow}>
                        <MaterialIcons name="fiber-manual-record" size={8} color={COLORS.slate400} style={{ marginTop: 6 }} />
                        <Text style={styles.featureItem}>Detaylı istatistikler</Text>
                    </View>
                </View>
            </View>

            {/* Quick Actions */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Hızlı Erişim</Text>
                <View style={styles.quickActions}>
                    <DashboardAction
                        label="Ekibim"
                        icon={<MaterialIcons name="groups" size={32} color={COLORS.indigo500} />}
                        onPress={() => navigation.navigate('TeamList')}
                        isActive={true}
                        style={{ flex: 1 }}
                    />
                    <DashboardAction
                        label="Takvim"
                        icon={<MaterialIcons name="calendar-today" size={32} color={COLORS.purple500} />}
                        onPress={() => navigation.navigate('Calendar')}
                        isActive={true}
                        style={{ flex: 1 }}
                    />
                </View>
                <View style={[styles.quickActions, { marginTop: 12 }]}>
                    <DashboardAction
                        label="İş Atama"
                        icon={<MaterialIcons name="assignment" size={32} color={COLORS.orange500} />}
                        onPress={() => navigation.navigate('JobAssignment')}
                        isActive={true}
                        style={{ flex: 1 }}
                    />
                </View>
                <View style={[styles.quickActions, { marginTop: 12 }]}>
                    <DashboardAction
                        label="Masraflar"
                        icon={<MaterialIcons name="attach-money" size={32} color={COLORS.green500} />}
                        onPress={() => navigation.navigate('CostManagement')}
                        isActive={true}
                        style={{ flex: 1 }}
                    />
                    <DashboardAction
                        label="Raporlar"
                        icon={<MaterialIcons name="bar-chart" size={32} color={COLORS.slate400} />}
                        isActive={false}
                        disabled={true}
                        comingSoon={true}
                        style={{ flex: 1 }}
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
        borderBottomColor: COLORS.slate800,
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
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        marginRight: 8,
        position: 'relative',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.primary,
    },
    logoutButton: {
        padding: 8,
    },
    statsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 10,
        marginBottom: 0,
    },
    comingSoonContainer: {
        margin: 16,
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 32,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    comingSoonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLORS.white,
        marginBottom: 12,
        textAlign: 'center',
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
    featureItemRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        gap: 8,
    },
    featureItem: {
        fontSize: 14,
        color: COLORS.slate400,
    },
    featureItemActive: {
        fontSize: 14,
        color: COLORS.primary,
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
        gap: 12,
    },
});
