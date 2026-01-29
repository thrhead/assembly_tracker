import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';
import { BarChart3, TrendingUp, DollarSign, Briefcase, Users, CheckCircle2, Calendar, ArrowRight, FileIcon, ShieldCheck } from 'lucide-react-native';
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
    const [activeTab, setActiveTab] = useState('performance');
    const [selectedTemplate, setSelectedTemplate] = useState('standard');
    const [selectedDay, setSelectedDay] = useState(null);

    const templates = [
        { id: 'standard', title: 'Standart', icon: FileIcon },
        { id: 'audit', title: 'Denetim', icon: ShieldCheck },
        { id: 'efficiency', title: 'Verimlilik', icon: TrendingUp },
        { id: 'cost_breakdown', title: 'Maliyet', icon: DollarSign },
    ];

    useEffect(() => {
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem('authToken');
            const [perfRes, costRes] = await Promise.all([
                axios.get(`${API_URL}/api/admin/reports/performance`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/api/admin/reports/costs`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setPerfData(perfRes.data);
            setCostData(costRes.data);

            // Set initial selected day to today
            if (perfRes.data.weeklySteps?.currentWeek?.length > 0) {
                setSelectedDay(perfRes.data.weeklySteps.currentWeek[perfRes.data.weeklySteps.currentWeek.length - 1]);
            }
        } catch (error) {
            console.error('Fetch reports error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    // Prepare chart data
    const stackData = perfData?.weeklySteps?.currentWeek?.map((day, idx) => {
        const date = new Date(day.date);
        const label = date.toLocaleDateString('tr-TR', { weekday: 'short' });
        const categories = perfData.weeklySteps.categories;
        const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

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

    return (
        <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: theme.colors.text }]}>Analiz & Raporlar</Text>
                <Text style={{ color: theme.colors.subText, fontSize: 14 }}>Performans ve Maliyet Analizi</Text>
            </View>

            {/* Template Selection */}
            <View style={{ marginBottom: 20 }}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text, marginLeft: 20, marginBottom: 12 }]}>Rapor Taslağı</Text>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}
                >
                    {templates.map((temp) => (
                        <TouchableOpacity
                            key={temp.id}
                            onPress={() => {
                                setSelectedTemplate(temp.id);
                                if (temp.id === 'cost_breakdown') setActiveTab('costs');
                                else setActiveTab('performance');
                            }}
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

            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'performance' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 }]}
                    onPress={() => setActiveTab('performance')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'performance' ? theme.colors.primary : theme.colors.subText }]}>Performans</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'costs' && { borderBottomColor: theme.colors.primary, borderBottomWidth: 3 }]}
                    onPress={() => setActiveTab('costs')}
                >
                    <Text style={[styles.tabText, { color: activeTab === 'costs' ? theme.colors.primary : theme.colors.subText }]}>Maliyetler</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'performance' ? (
                <View style={styles.content}>
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

                    {/* Advanced Weekly Chart */}
                    <GlassCard style={styles.chartCard} theme={theme}>
                        <View style={styles.cardHeader}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                                <TrendingUp size={18} color={theme.colors.primary} />
                                <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Haftalık Tamamlanan Adımlar</Text>
                            </View>
                        </View>

                        <View style={{ marginTop: 20, alignItems: 'center' }}>
                            <BarChart
                                stackData={stackData}
                                height={200}
                                width={width - 80}
                                barWidth={30}
                                spacing={15}
                                noOfSections={4}
                                barBorderRadius={4}
                                xAxisThickness={0}
                                yAxisThickness={0}
                                yAxisTextStyle={{ color: theme.colors.subText, fontSize: 10 }}
                                xAxisLabelTextStyle={{ color: theme.colors.subText, fontSize: 10 }}
                                hideRules
                                showVerticalLines={false}
                                isAnimated
                                animationDuration={1000}
                            />
                        </View>

                        {/* Legend */}
                        <View style={styles.legendContainer}>
                            {perfData?.weeklySteps?.categories.map((cat, idx) => (
                                <View key={cat} style={styles.legendItem}>
                                    <View style={[styles.legendDot, { backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][idx % 5] }]} />
                                    <Text style={[styles.legendText, { color: theme.colors.subText }]}>{cat}</Text>
                                </View>
                            ))}
                        </View>
                    </GlassCard>

                    {/* Selected Day Details */}
                    {selectedDay && (
                        <View style={styles.detailsContainer}>
                            <View style={styles.detailsHeader}>
                                <Calendar size={16} color={theme.colors.primary} />
                                <Text style={[styles.detailsTitle, { color: theme.colors.text }]}>
                                    {new Date(selectedDay.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                                </Text>
                            </View>
                            <View style={styles.jobList}>
                                {selectedDay.jobs?.length > 0 ? (
                                    selectedDay.jobs.map((job, idx) => (
                                        <TouchableOpacity key={idx} style={[styles.jobRow, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                                            <Text style={[styles.jobName, { color: theme.colors.text }]} numberOfLines={1}>{job.title}</Text>
                                            <ArrowRight size={16} color={theme.colors.primary} />
                                        </TouchableOpacity>
                                    ))
                                ) : (
                                    <Text style={{ color: theme.colors.subText, fontStyle: 'italic', textAlign: 'center', padding: 20 }}>
                                        Bu güne ait kayıt bulunamadı.
                                    </Text>
                                )}
                            </View>
                        </View>
                    )}
                </View>
            ) : (
                <View style={styles.content}>
                    {/* Cost content... existing logic maintained but styled better */}
                    <View style={styles.statsGrid}>
                        <GlassCard style={styles.statCard} theme={theme}>
                            <DollarSign size={20} color={theme.colors.success} />
                            <Text style={[styles.statVal, { color: theme.colors.text }]}>₺{perfData?.stats?.totalCost.toLocaleString()}</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Toplam Maliyet</Text>
                        </GlassCard>
                        <GlassCard style={styles.statCard} theme={theme}>
                            <TrendingUp size={20} color={theme.colors.warning} />
                            <Text style={[styles.statVal, { color: theme.colors.text }]}>{perfData?.stats?.pendingApprovals}</Text>
                            <Text style={[styles.statLabel, { color: theme.colors.subText }]}>Bekleyen Onay</Text>
                        </GlassCard>
                    </View>

                    <GlassCard style={styles.chartCard} theme={theme}>
                        <View style={styles.cardHeader}>
                            <BarChart3 size={18} color={theme.colors.success} />
                            <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Maliyet Dağılımı</Text>
                        </View>
                        <View style={styles.teamList}>
                            {Object.entries(costData?.breakdown || {}).map(([cat, val], idx) => (
                                <View key={idx} style={[styles.teamRow, { borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }]}>
                                    <Text style={[styles.teamName, { color: theme.colors.text }]}>{cat}</Text>
                                    <Text style={[styles.teamVal, { color: theme.colors.success }]}>₺{val.toLocaleString()}</Text>
                                </View>
                            ))}
                        </View>
                    </GlassCard>
                </View>
            )}
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
    statLabel: { fontSize: 12, fontWeight: '600', letterSpacing: 0.5, textTransform: 'uppercase' },
    chartCard: { padding: 24, marginBottom: 20, borderRadius: 28 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    cardTitle: { fontSize: 18, fontWeight: '700' },
    legendContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 24, justifyContent: 'center' },
    legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    legendDot: { width: 8, height: 8, borderRadius: 4 },
    legendText: { fontSize: 11, fontWeight: '600' },
    detailsContainer: { marginBottom: 40 },
    detailsHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 16 },
    detailsTitle: { fontSize: 18, fontWeight: '700' },
    jobList: { gap: 10 },
    jobRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderRadius: 16, borderWidth: 1 },
    jobName: { fontSize: 15, fontWeight: '600', flex: 1, marginRight: 10 },
    teamList: { gap: 12 },
    teamRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, paddingBottom: 12 },
    teamName: { fontSize: 14, fontWeight: '500' },
    teamVal: { fontSize: 14, fontWeight: '700' },
    sectionTitle: { fontSize: 16, fontWeight: '700', marginBottom: 8 },
    templateChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 1,
        gap: 8,
    },
    templateText: {
        fontSize: 14,
        fontWeight: '600',
    },
});

export default ReportsScreen;
