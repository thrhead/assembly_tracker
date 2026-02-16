import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, Platform, FlatList } from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';
import { BarChart3, TrendingUp, DollarSign, Briefcase, Users, CheckCircle2, Calendar, ArrowRight, FileIcon, ShieldCheck, Zap, Award } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../config';
import GlassCard from '../../components/ui/GlassCard';

const { width } = Dimensions.get('window');

const ReportsScreen = () => {
    const { theme, isDark } = useTheme();
    const [loading, setLoading] = useState(true);
    const [perfData, setPerfData] = useState(null);
    const [costData, setCostData] = useState(null);
    const [teamsData, setTeamsData] = useState(null);
    const [activeTab, setActiveTab] = useState('performance'); // 'performance', 'costs', 'teams'
    const [selectedTemplate, setSelectedTemplate] = useState('standard');
    const [selectedDay, setSelectedDay] = useState(null);

    const templates = [
        { id: 'standard', title: 'Standart', icon: FileIcon, tab: 'performance' },
        { id: 'audit', title: 'Denetim', icon: ShieldCheck, tab: 'performance' },
        { id: 'efficiency', title: 'Verimlilik', icon: Zap, tab: 'teams' },
        { id: 'cost_breakdown', title: 'Maliyet', icon: DollarSign, tab: 'costs' },
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('authToken');
            const headers = { Authorization: `Bearer ${token}` };
            
            const [perfRes, costRes, teamsRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/reports/performance`, { headers }),
                axios.get(`${API_URL}/api/admin/reports/costs`, { headers }),
                axios.get(`${API_URL}/api/admin/reports/teams`, { headers }).catch(() => ({ data: { reports: [], globalStats: {} } }))
            ]);
            
            setPerfData(perfRes.data);
            setCostData(costRes.data);
            setTeamsData(teamsRes.data);

            if (perfRes.data.weeklySteps?.currentWeek?.length > 0) {
                setSelectedDay(perfRes.data.weeklySteps.currentWeek[perfRes.data.weeklySteps.currentWeek.length - 1]);
            }
        } catch (error) {
            console.error('Fetch reports error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTemplateSelect = (temp) => {
        setSelectedTemplate(temp.id);
        setActiveTab(temp.tab);
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Chart Data Preparation
    const getFilteredStackData = () => {
        if (!perfData?.weeklySteps?.currentWeek) return [];
        
        return perfData.weeklySteps.currentWeek.map((day) => {
            const date = new Date(day.date);
            const label = date.toLocaleDateString('tr-TR', { weekday: 'short' });
            let categories = perfData.weeklySteps.categories;
            const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

            // Template based filtering for the chart
            if (selectedTemplate === 'audit') {
                // Focus on specific steps if needed
            }

            return {
                stacks: categories.map((cat, cIdx) => ({
                    value: day[cat] || 0,
                    color: colors[cIdx % colors.length],
                    marginBottom: 2
                })),
                label: label,
                onPress: () => setSelectedDay(day)
            };
        });
    };

    const renderTeamItem = ({ item }) => (
        <GlassCard style={styles.teamCard} theme={theme}>
            <View style={styles.teamHeader}>
                <View style={{ flex: 1 }}>
                    <Text style={[styles.teamName, { color: theme.colors.text }]}>{item.name}</Text>
                    <Text style={{ color: theme.colors.subText, fontSize: 12 }}>Lider: {item.leadName}</Text>
                </View>
                <View style={[styles.efficiencyBadge, { backgroundColor: item.stats.efficiencyScore > 80 ? 'rgba(34, 197, 94, 0.1)' : 'rgba(99, 102, 241, 0.1)' }]}>
                    <Zap size={14} color={item.stats.efficiencyScore > 80 ? '#22c55e' : theme.colors.primary} />
                    <Text style={[styles.efficiencyText, { color: item.stats.efficiencyScore > 80 ? '#22c55e' : theme.colors.primary }]}>
                        %{item.stats.efficiencyScore}
                    </Text>
                </View>
            </View>
            
            <View style={styles.teamStatsRow}>
                <View style={styles.teamStat}>
                    <Text style={styles.teamStatLabel}>İŞLER</Text>
                    <Text style={[styles.teamStatVal, { color: theme.colors.text }]}>{item.stats.completedJobs}/{item.stats.totalJobs}</Text>
                </View>
                <View style={styles.teamStat}>
                    <Text style={styles.teamStatLabel}>GİDER</Text>
                    <Text style={[styles.teamStatVal, { color: theme.colors.text }]}>₺{item.stats.totalExpenses.toLocaleString('tr-TR')}</Text>
                </View>
                <View style={styles.teamStat}>
                    <Text style={styles.teamStatLabel}>SÜRE</Text>
                    <Text style={[styles.teamStatVal, { color: theme.colors.text }]}>{item.stats.totalWorkingHours}s</Text>
                </View>
            </View>

            <View style={styles.progressBarBg}>
                <View style={[styles.progressBarFill, { width: `${item.stats.efficiencyScore}%`, backgroundColor: theme.colors.primary }]} />
            </View>
        </GlassCard>
    );

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Analiz & Raporlar</Text>
                <Text style={{ color: theme.colors.subText, fontSize: 14 }}>{selectedTemplate.toUpperCase()} Görünümü Aktif</Text>
            </View>

            {/* Rapor Taslağı (Şablonlar) */}
            <View style={{ marginBottom: 24 }}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, marginLeft: 20, marginBottom: 12 }]}>Rapor Taslağı</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                >
                    {templates.map((temp) => (
                        <TouchableOpacity
                            key={temp.id}
                            onPress={() => handleTemplateSelect(temp)}
                            style={[
                                styles.templateChip,
                                {
                                    backgroundColor: selectedTemplate === temp.id ? theme.colors.primary : theme.colors.card,
                                    borderColor: selectedTemplate === temp.id ? theme.colors.primary : theme.colors.cardBorder
                                }
                            ]}
                        >
                            <temp.icon size={16} color={selectedTemplate === temp.id ? '#fff' : theme.colors.primary} />
                            <Text style={[
                                styles.templateText,
                                { color: selectedTemplate === temp.id ? '#fff' : theme.colors.text }
                            ]}>
                                {temp.title}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Sekme Seçimi */}
            <View style={styles.tabContainer}>
                {[
                    { id: 'performance', label: 'Performans', icon: TrendingUp },
                    { id: 'costs', label: 'Maliyetler', icon: DollarSign },
                    { id: 'teams', label: 'Ekipler', icon: Users }
                ].map((tab) => (
                    <TouchableOpacity
                        key={tab.id}
                        style={[styles.tab, activeTab === tab.id && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 }]}
                        onPress={() => setActiveTab(tab.id)}
                    >
                        <Text style={[styles.tabText, { color: activeTab === tab.id ? theme.colors.primary : theme.colors.subText }]}>{tab.label}</Text>
                    </TouchableOpacity>
                ))}
            </View>

            <View style={styles.content}>
                {activeTab === 'performance' && (
                    <View style={styles.animateContent}>
                        <View style={styles.statsGrid}>
                            <GlassCard style={styles.statCard} theme={theme}>
                                <Briefcase size={20} color={theme.colors.primary} />
                                <Text style={[styles.statVal, { color: theme.colors.text }]}>{perfData?.stats?.totalJobs}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Toplam İş</Text>
                            </GlassCard>
                            <GlassCard style={styles.statCard} theme={theme}>
                                <CheckCircle2 size={20} color={theme.colors.success} />
                                <Text style={[styles.statVal, { color: theme.colors.text }]}>{perfData?.stats?.completedJobs}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Tamamlanan</Text>
                            </GlassCard>
                        </View>

                        <GlassCard style={styles.chartCard} theme={theme}>
                            <View style={styles.cardHeader}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                    <TrendingUp size={18} color={theme.colors.primary} />
                                    <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Haftalık İlerleme</Text>
                                </View>
                            </View>
                            <View style={{ marginTop: 20, alignItems: 'center' }}>
                                <BarChart
                                    stackData={getFilteredStackData()}
                                    height={200}
                                    width={width - 80}
                                    barWidth={28}
                                    spacing={15}
                                    barBorderRadius={4}
                                    xAxisThickness={0}
                                    yAxisThickness={0}
                                    yAxisTextStyle={{ color: theme.colors.subText, fontSize: 10 }}
                                    xAxisLabelTextStyle={{ color: theme.colors.subText, fontSize: 10 }}
                                    hideRules
                                    isAnimated
                                />
                            </View>
                        </GlassCard>
                    </View>
                )}

                {activeTab === 'costs' && (
                    <View style={styles.animateContent}>
                        <View style={styles.statsGrid}>
                            <GlassCard style={styles.statCard} theme={theme}>
                                <DollarSign size={20} color={theme.colors.success} />
                                <Text style={[styles.statVal, { color: theme.colors.text }]}>₺{perfData?.stats?.totalCost?.toLocaleString()}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Toplam Gider</Text>
                            </GlassCard>
                            <GlassCard style={styles.statCard} theme={theme}>
                                <TrendingUp size={20} color={theme.colors.warning} />
                                <Text style={[styles.statVal, { color: theme.colors.text }]}>{perfData?.stats?.pendingApprovals}</Text>
                                <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Bekleyen Onay</Text>
                            </GlassCard>
                        </View>

                        <GlassCard style={styles.chartCard} theme={theme}>
                            <Text style={[styles.cardTitle, { color: theme.colors.text, marginBottom: 16 }]}>Kategori Dağılımı</Text>
                            {Object.entries(costData?.breakdown || {}).map(([cat, val], idx) => (
                                <View key={idx} style={styles.costRow}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                        <View style={[styles.legendDot, { backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'][idx % 4] }]} />
                                        <Text style={{ color: theme.colors.text }}>{cat}</Text>
                                    </View>
                                    <Text style={{ fontWeight: 'bold', color: theme.colors.text }}>₺{val.toLocaleString()}</Text>
                                </View>
                            ))}
                        </GlassCard>
                    </View>
                )}

                {activeTab === 'teams' && (
                    <View style={styles.animateContent}>
                        <View style={styles.globalStatsRow}>
                            <View style={styles.globalStatItem}>
                                <Text style={[styles.globalStatVal, { color: theme.colors.primary }]}>{teamsData?.globalStats?.totalTeams || 0}</Text>
                                <Text style={styles.globalStatLabel}>EKİP</Text>
                            </View>
                            <View style={[styles.verticalDivider, { backgroundColor: theme.colors.cardBorder }]} />
                            <View style={styles.globalStatItem}>
                                <Text style={[styles.globalStatVal, { color: theme.colors.success }]}>%{teamsData?.globalStats?.avgEfficiency || 0}</Text>
                                <Text style={styles.globalStatLabel}>VERİMLİLİK</Text>
                            </View>
                            <View style={[styles.verticalDivider, { backgroundColor: theme.colors.cardBorder }]} />
                            <View style={styles.globalStatItem}>
                                <Text style={[styles.globalStatVal, { color: '#f59e0b' }]}>{teamsData?.globalStats?.totalEmployees || 0}</Text>
                                <Text style={styles.globalStatLabel}>PERSONEL</Text>
                            </View>
                        </View>

                        {teamsData?.reports?.map((team) => (
                            <View key={team.id}>
                                {renderTeamItem({ item: team })}
                            </View>
                        ))}
                    </View>
                )}
            </View>
            <View style={{ height: 100 }} />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40 },
    title: { fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
    tabContainer: { flexDirection: 'row', paddingHorizontal: 20, marginBottom: 16 },
    tab: { paddingVertical: 12, marginRight: 24 },
    tabText: { fontSize: 16, fontWeight: '700' },
    content: { padding: 20 },
    statsGrid: { flexDirection: 'row', gap: 12, marginBottom: 20 },
    statCard: { flex: 1, padding: 20, alignItems: 'center', borderRadius: 24 },
    statVal: { fontSize: 24, fontWeight: '800', marginVertical: 6 },
    statLabel: { fontSize: 10, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' },
    chartCard: { padding: 24, marginBottom: 20, borderRadius: 28 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700' },
    templateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    templateText: { fontSize: 14, fontWeight: '600' },
    sectionTitle: { fontSize: 16, fontWeight: '700' },
    costRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: 'rgba(0,0,0,0.05)' },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    teamCard: { padding: 20, marginBottom: 16, borderRadius: 20 },
    teamHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    teamName: { fontSize: 18, fontWeight: 'bold' },
    efficiencyBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 12 },
    efficiencyText: { fontSize: 12, fontWeight: 'bold' },
    teamStatsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    teamStat: { alignItems: 'flex-start' },
    teamStatLabel: { fontSize: 9, fontWeight: '800', color: '#94a3b8', marginBottom: 4 },
    teamStatVal: { fontSize: 14, fontWeight: 'bold' },
    progressBarBg: { height: 6, backgroundColor: 'rgba(0,0,0,0.05)', borderRadius: 3, overflow: 'hidden' },
    progressBarFill: { height: '100%', borderRadius: 3 },
    globalStatsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 24, paddingVertical: 16, backgroundColor: 'rgba(0,0,0,0.02)', borderRadius: 16 },
    globalStatItem: { alignItems: 'center' },
    globalStatVal: { fontSize: 20, fontWeight: '800' },
    globalStatLabel: { fontSize: 10, fontWeight: '700', color: '#94a3b8', marginTop: 2 },
    verticalDivider: { width: 1, height: 30 },
    animateContent: { opacity: 1 },
});

export default ReportsScreen;
