import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, StatusBar, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import GlassCard from '../../components/ui/GlassCard';
import StatCard from '../../components/StatCard';
import { useManagerDashboardStats } from '../../hooks/useManagerDashboardStats';
import { useAlert } from '../../context/AlertContext';

export default function ManagerDashboardScreen({ navigation }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme, isDark } = useTheme();
    const { showAlert } = useAlert();
    const { statsData, fetchStats, loading } = useManagerDashboardStats();

    React.useEffect(() => {
        fetchStats();
    }, []);

    const handleLogout = async () => {
        showAlert(
            'Çıkış Yap',
            'Çıkmak istediğinize emin misiniz?',
            [
                { text: 'İptal', style: 'cancel' },
                {
                    text: 'Çıkış Yap',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await logout();
                        } catch (error) {
                            console.error('Logout error:', error);
                        }
                    }
                }
            ],
            'question'
        );
    };

    return (
        <LinearGradient
            colors={theme.colors.gradient}
            start={theme.colors.gradientStart}
            end={theme.colors.gradientEnd}
            style={{ flex: 1 }}
        >
            <ScrollView
                style={styles.container}
                contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
                showsVerticalScrollIndicator={false}
            >
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
                                <Text style={{ color: theme.colors.subText, fontSize: 10, fontWeight: '600' }}>TÜM İŞLER</Text>
                                <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>{statsData.totalJobs}</Text>
                            </View>
                            <MaterialIcons name="work" size={28} color={theme.colors.primary} />
                        </View>
                    </GlassCard>

                    <GlassCard theme={theme} style={{ flex: 1, margin: 6, padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={{ color: theme.colors.subText, fontSize: 10, fontWeight: '600' }}>AKTİF EKİPLER</Text>
                                <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>{statsData.activeTeams}</Text>
                            </View>
                            <MaterialIcons name="groups" size={28} color="#3b82f6" />
                        </View>
                    </GlassCard>
                </View>

                <View style={styles.statsContainer}>
                    <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Approvals')}>
                        <GlassCard theme={theme} style={{ flex: 1, margin: 6, padding: 16 }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                                <View>
                                    <Text style={{ color: theme.colors.subText, fontSize: 10, fontWeight: '600' }}>BEKLEYEN ONAYLAR</Text>
                                    <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>{statsData.pendingApprovals}</Text>
                                </View>
                                <MaterialIcons name="pending-actions" size={28} color="#f59e0b" />
                            </View>
                        </GlassCard>
                    </TouchableOpacity>

                    <GlassCard theme={theme} style={{ flex: 1, margin: 6, padding: 16 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View>
                                <Text style={{ color: theme.colors.subText, fontSize: 10, fontWeight: '600' }}>AYLIK TAMAMLANAN</Text>
                                <Text style={{ color: theme.colors.text, fontSize: 24, fontWeight: 'bold' }}>{statsData.completedJobsThisMonth}</Text>
                            </View>
                            <MaterialIcons name="check-circle" size={28} color="#22c55e" />
                        </View>
                    </GlassCard>
                </View>

                {/* Team Performance Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Ekip Performansı</Text>
                    <GlassCard theme={theme} style={{ padding: 20 }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                            <Text style={{ color: theme.colors.text, fontWeight: '700' }}>Genel Verimlilik Skoru</Text>
                            <View style={{ backgroundColor: '#6366f120', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 }}>
                                <Text style={{ color: '#6366f1', fontWeight: 'bold' }}>%{statsData.efficiencyScore || 0}</Text>
                            </View>
                        </View>
                        <View style={styles.progressContainer}>
                            <View style={[styles.progressBg, { backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }]} />
                            <View style={[styles.progressFill, { backgroundColor: '#6366f1', width: `${statsData.efficiencyScore || 0}%` }]} />
                        </View>
                    </GlassCard>
                </View>

                {/* Recent Activity Section */}
                <View style={styles.section}>
                    <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Son Faaliyetler</Text>
                    {statsData.recentJobs?.length > 0 ? (
                        statsData.recentJobs.map((job) => (
                            <TouchableOpacity
                                key={job.id}
                                style={[styles.jobItem, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                                onPress={() => navigation.navigate('JobDetail', { jobId: job.id })}
                            >
                                <View style={[styles.jobIcon, { backgroundColor: theme.colors.primaryBg }]}>
                                    <MaterialIcons name="business" size={20} color={theme.colors.primary} />
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: theme.colors.text, fontWeight: '600', fontSize: 14 }} numberOfLines={1}>{job.title}</Text>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                                        <Text style={{ color: theme.colors.subText, fontSize: 12 }}>{job.customer?.company}</Text>
                                        <Text style={{ color: theme.colors.subText, fontSize: 12 }}>•</Text>
                                        <Text style={{ color: theme.colors.subText, fontSize: 12 }}>{new Date(job.createdAt).toLocaleDateString('tr-TR')}</Text>
                                    </View>
                                </View>
                                <MaterialIcons name="chevron-right" size={24} color={theme.colors.icon} />
                            </TouchableOpacity>
                        ))
                    ) : (
                        <GlassCard theme={theme} style={{ padding: 20, alignItems: 'center' }}>
                            <Text style={{ color: theme.colors.subText, fontStyle: 'italic' }}>Henüz faaliyet bulunamadı.</Text>
                        </GlassCard>
                    )}
                </View>

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
                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 12 }} onPress={() => navigation.navigate('AdvancedPlanning')}>
                            <MaterialIcons name="trending-up" size={32} color={theme.colors.primary} />
                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Planlama</Text>
                        </GlassCard>
                    </View>
                    <View style={[styles.quickActions, { marginTop: 12 }]}>
                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 12 }} onPress={() => navigation.navigate('CostManagement')}>
                            <MaterialIcons name="attach-money" size={32} color="#22c55e" />
                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Masraflar</Text>
                        </GlassCard>

                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 12 }} onPress={() => navigation.navigate('CustomerManagement', { openCreate: true })}>
                            <MaterialIcons name="business" size={32} color="#14b8a6" />
                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Müşteri Ekle</Text>
                        </GlassCard>
                    </View>
                    <View style={[styles.quickActions, { marginTop: 12 }]}>
                        <GlassCard theme={theme} style={{ flex: 1, padding: 16, alignItems: 'center', gap: 12 }} onPress={() => navigation.navigate('Reports')}>
                            <MaterialIcons name="bar-chart" size={32} color="#ec4899" />
                            <Text style={{ color: theme.colors.text, fontWeight: '600' }}>Raporlar</Text>
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
    jobItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 8,
        gap: 12,
    },
    jobIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    progressContainer: {
        height: 12,
        width: '100%',
        position: 'relative',
        borderRadius: 6,
        overflow: 'hidden',
    },
    progressBg: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
    progressFill: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        borderRadius: 6,
    },
});
