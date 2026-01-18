import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../../components/ui/GlassCard';
import StatCard from '../../components/StatCard'; // TODO: Update StatCard to support theme or wrap it

export default function ManagerDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();

    const handleLogout = async () => {
        await logout();
    };

    return (
        <LinearGradient
            colors={theme.colors.gradient}
            start={theme.colors.gradientStart}
            end={theme.colors.gradientEnd}
            style={{ flex: 1 }}
        >
            <ScrollView style={styles.container}>
                <StatusBar
                    barStyle={isDark ? "light-content" : "dark-content"}
                    backgroundColor="transparent"
                    translucent
                />

                {/* Header */}
                <View style={[styles.header, { borderBottomColor: theme.colors.cardBorder, backgroundColor: isDark ? 'rgba(17, 24, 39, 0.5)' : 'rgba(255,255,255,0.5)' }]}>
                    <View>
                        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Manager Dashboard</Text>
                        <Text style={[styles.headerSubtitle, { color: theme.colors.subText }]}>Ekip Yönetimi</Text>
                    </View>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity
                            style={[styles.headerButton, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder, borderWidth: 1, borderRadius: 20 }]}
                            onPress={toggleTheme}
                        >
                            <MaterialIcons name={isDark ? "light-mode" : "dark-mode"} size={20} color={theme.colors.icon} />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Notifications')}>
                            <MaterialIcons name="notifications-none" size={24} color={theme.colors.icon} />
                            <View style={[styles.notificationBadge, { backgroundColor: theme.colors.primary }]} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.headerButton} onPress={() => navigation.navigate('Profile')}>
                            <MaterialIcons name="settings" size={24} color={theme.colors.icon} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
                            <MaterialIcons name="logout" size={24} color="#ef4444" />
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Quick Stats - Wrapped in GlassCards or using updated StatCard if we had one. 
                    For now, creating a custom Stat View using GlassCard to ensure styling match */}
                <View style={styles.statsContainer}>
                    <GlassCard theme={theme} style={{ flex: 1, margin: 6, padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={{ color: theme.colors.subText, fontSize: 12, fontWeight: '600' }}>EKİP ÜYELERİ</Text>
                                <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>8</Text>
                            </View>
                            <MaterialIcons name="group" size={32} color={theme.colors.primary} />
                        </View>
                    </GlassCard>

                    <GlassCard theme={theme} style={{ flex: 1, margin: 6, padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={{ color: theme.colors.subText, fontSize: 12, fontWeight: '600' }}>AKTİF İŞLER</Text>
                                <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>12</Text>
                            </View>
                            <MaterialIcons name="assignment" size={32} color="#3b82f6" />
                        </View>
                    </GlassCard>
                </View>

                <View style={styles.statsContainer}>
                    <GlassCard theme={theme} style={{ flex: 1, margin: 6, padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={{ color: theme.colors.subText, fontSize: 12, fontWeight: '600' }}>ONAY BEKLEYEN</Text>
                                <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>5</Text>
                            </View>
                            <MaterialIcons name="pending-actions" size={32} color="#f59e0b" />
                        </View>
                    </GlassCard>

                    <GlassCard theme={theme} style={{ flex: 1, margin: 6, padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={{ color: theme.colors.subText, fontSize: 12, fontWeight: '600' }}>TAMAMLANMA</Text>
                                <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>87%</Text>
                            </View>
                            <MaterialIcons name="check-circle" size={32} color="#22c55e" />
                        </View>
                    </GlassCard>
                </View>

                {/* Coming Soon Section */}
                <GlassCard theme={theme} style={styles.comingSoonContainer}>
                    <MaterialIcons name="rocket-launch" size={64} color={theme.colors.primary} style={{ marginBottom: 16 }} />
                    <Text style={[styles.comingSoonTitle, { color: theme.colors.text }]}>Daha Fazla Özellik Yakında!</Text>
                    <Text style={[styles.comingSoonText, { color: theme.colors.subText }]}>
                        Şu anda kullanılabilir özellikler:
                    </Text>
                    <View style={styles.featureList}>
                        <View style={styles.featureItemRow}>
                            <MaterialIcons name="check" size={16} color={theme.colors.primary} />
                            <Text style={[styles.featureItemActive, { color: theme.colors.primary }]}>Ekip performans görüntüleme</Text>
                        </View>
                        <View style={styles.featureItemRow}>
                            <MaterialIcons name="check" size={16} color={theme.colors.primary} />
                            <Text style={[styles.featureItemActive, { color: theme.colors.primary }]}>İş atama ve yönetimi</Text>
                        </View>
                        <View style={styles.featureItemRow}>
                            <MaterialIcons name="fiber-manual-record" size={8} color={theme.colors.subText} style={{ marginTop: 6 }} />
                            <Text style={[styles.featureItem, { color: theme.colors.subText }]}>Onay bekleyen işlemler</Text>
                        </View>
                        <View style={styles.featureItemRow}>
                            <MaterialIcons name="fiber-manual-record" size={8} color={theme.colors.subText} style={{ marginTop: 6 }} />
                            <Text style={[styles.featureItem, { color: theme.colors.subText }]}>Müşteri yönetimi</Text>
                        </View>
                        <View style={styles.featureItemRow}>
                            <MaterialIcons name="fiber-manual-record" size={8} color={theme.colors.subText} style={{ marginTop: 6 }} />
                            <Text style={[styles.featureItem, { color: theme.colors.subText }]}>Detaylı istatistikler</Text>
                        </View>
                    </View>
                </GlassCard>

                {/* Quick Actions */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Hızlı Erişim</Text>
                    <View style={styles.quickActions}>
                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 12 }} onPress={() => navigation.navigate('TeamList')}>
                            <MaterialIcons name="groups" size={32} color="#6366f1" />
                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Ekibim</Text>
                        </GlassCard>
                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 12 }} onPress={() => navigation.navigate('Calendar')}>
                            <MaterialIcons name="calendar-today" size={32} color="#a855f7" />
                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Takvim</Text>
                        </GlassCard>
                    </View>
                    <View style={[styles.quickActions, { marginTop: 12 }]}>
                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 12 }} onPress={() => navigation.navigate('JobAssignment')}>
                            <MaterialIcons name="assignment" size={32} color="#f97316" />
                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>İş Atama</Text>
                        </GlassCard>
                    </View>
                    <View style={[styles.quickActions, { marginTop: 12 }]}>
                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 12 }} onPress={() => navigation.navigate('CostManagement')}>
                            <MaterialIcons name="attach-money" size={32} color="#22c55e" />
                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Masraflar</Text>
                        </GlassCard>

                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 12, opacity: 0.6 }}>
                            <MaterialIcons name="bar-chart" size={32} color={theme.colors.subText} />
                            <Text style={{ color: theme.colors.subText, fontWeight: '600' }}>Raporlar</Text>
                            <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: theme.colors.cardBorder, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                                <Text style={{ fontSize: 9, color: theme.colors.subText }}>Yakında</Text>
                            </View>
                        </GlassCard>
                    </View>
                </View>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        padding: 20,
        paddingTop: 45, // approx StatusBar height + padding
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 16,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerButton: {
        padding: 8,
        marginRight: 8,
        position: 'relative',
        justifyContent: 'center',
        alignItems: 'center',
    },
    notificationBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 8,
        height: 8,
        borderRadius: 4,
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
        padding: 32,
        alignItems: 'center',
    },
    comingSoonTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 12,
        textAlign: 'center',
    },
    comingSoonText: {
        fontSize: 16,
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
    },
    featureItemActive: {
        fontSize: 14,
        fontWeight: '600',
    },
    section: {
        padding: 16,
        paddingBottom: 40,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    quickActions: {
        flexDirection: 'row',
        gap: 12,
    },
});
