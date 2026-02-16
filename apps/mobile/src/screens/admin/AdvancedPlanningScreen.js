import React, { useState, useEffect, useMemo } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    RefreshControl,
    Dimensions
} from 'react-native';
import { Calendar as CalendarIcon, Filter, Clock, MapPin, Users, ChevronRight, LayoutGrid, List } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const { width } = Dimensions.get('window');

const AdvancedPlanningScreen = () => {
    const { theme, isDark } = useTheme();
    const { t, i18n } = useTranslation();
    const [data, setData] = useState({ jobs: [], teams: [] });
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedTeamId, setSelectedTeamId] = useState(null);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'timeline'

    const fetchPlanningData = async () => {
        try {
            const response = await api.get('/api/admin/planning');
            setData(response.data);
        } catch (error) {
            console.error('Fetch planning error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchPlanningData();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchPlanningData();
    };

    const filteredJobs = useMemo(() => {
        return selectedTeamId
            ? data.jobs.filter(j => j.teamId === selectedTeamId)
            : data.jobs;
    }, [data.jobs, selectedTeamId]);

    // Group jobs by date for timeline view
    const groupedJobs = useMemo(() => {
        const groups = {};
        filteredJobs.forEach(job => {
            const date = new Date(job.start).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', {
                day: '2-digit',
                month: 'short',
                weekday: 'short'
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(job);
        });
        return Object.entries(groups).sort((a, b) => new Date(a[1][0].start) - new Date(b[1][0].start));
    }, [filteredJobs, i18n.language]);

    const renderStatusBadge = (status) => {
        const colors = {
            PLANNED: { bg: 'rgba(59, 130, 246, 0.1)', text: '#3B82F6', label: t('manager.planned') },
            ASSIGNED: { bg: 'rgba(99, 102, 241, 0.1)', text: '#6366F1', label: t('manager.assigned') },
            IN_PROGRESS: { bg: 'rgba(245, 158, 11, 0.1)', text: '#F59E0B', label: t('manager.inProgress') },
            COMPLETED: { bg: 'rgba(34, 197, 94, 0.1)', text: '#22C55E', label: t('common.success') }
        };
        const config = colors[status] || { bg: 'rgba(107, 114, 128, 0.1)', text: '#6B7280', label: status };
        return (
            <View style={[styles.badge, { backgroundColor: config.bg }]}>
                <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
            </View>
        );
    };

    if (loading && !refreshing) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            {/* Header / Tabs */}
            <View style={[styles.header, { borderBottomColor: theme.colors.cardBorder }]}>
                <View style={styles.viewToggle}>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, viewMode === 'list' && { backgroundColor: theme.colors.primary }]}
                        onPress={() => setViewMode('list')}
                    >
                        <List size={18} color={viewMode === 'list' ? (isDark ? '#000' : '#FFF') : theme.colors.subText} />
                        <Text style={[styles.toggleText, { color: viewMode === 'list' ? (isDark ? '#000' : '#FFF') : theme.colors.subText }]}>{t('common.search')}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.toggleBtn, viewMode === 'timeline' && { backgroundColor: theme.colors.primary }]}
                        onPress={() => setViewMode('timeline')}
                    >
                        <CalendarIcon size={18} color={viewMode === 'timeline' ? (isDark ? '#000' : '#FFF') : theme.colors.subText} />
                        <Text style={[styles.toggleText, { color: viewMode === 'timeline' ? (isDark ? '#000' : '#FFF') : theme.colors.subText }]}>{t('manager.timeline')}</Text>
                    </TouchableOpacity>
                </View>

                {/* Team Filter */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    <TouchableOpacity
                        style={[
                            styles.filterItem,
                            !selectedTeamId && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                            { borderColor: theme.colors.cardBorder, borderWidth: 1 }
                        ]}
                        onPress={() => setSelectedTeamId(null)}
                    >
                        <Text style={[styles.filterText, !selectedTeamId ? { color: isDark ? '#000' : '#FFF' } : { color: theme.colors.text }]}>{t('manager.filterAll')}</Text>
                    </TouchableOpacity>
                    {data.teams.map(team => (
                        <TouchableOpacity
                            key={team.id}
                            style={[
                                styles.filterItem,
                                selectedTeamId === team.id && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
                                { borderColor: theme.colors.cardBorder, borderWidth: 1 }
                            ]}
                            onPress={() => setSelectedTeamId(team.id)}
                        >
                            <Text style={[
                                styles.filterText,
                                selectedTeamId === team.id ? { color: isDark ? '#000' : '#FFF' } : { color: theme.colors.text }
                            ]}>{team.name}</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
            >
                {filteredJobs.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <CalendarIcon size={64} color={theme.colors.cardBorder} />
                        <Text style={[styles.emptyText, { color: theme.colors.subText }]}>{t('manager.noPlanningData')}</Text>
                    </View>
                ) : viewMode === 'list' ? (
                    filteredJobs.map(job => (
                        <TouchableOpacity 
                            key={job.id} 
                            style={[styles.jobCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}
                        >
                            <View style={styles.jobHeader}>
                                <Text style={[styles.jobTitle, { color: theme.colors.text }]}>{job.title}</Text>
                                {renderStatusBadge(job.status)}
                            </View>

                            <View style={styles.infoRow}>
                                <MapPin size={14} color={theme.colors.subText} />
                                <Text style={[styles.infoText, { color: theme.colors.subText }]}>{job.customer}</Text>
                            </View>

                            <View style={styles.infoRow}>
                                <Clock size={14} color={theme.colors.subText} />
                                <Text style={[styles.infoText, { color: theme.colors.subText }]}>
                                    {new Date(job.start).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')} {new Date(job.start).toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                </Text>
                            </View>

                            <View style={[styles.teamFooter, { borderTopColor: theme.colors.cardBorder }]}>
                                <Users size={14} color={theme.colors.primary} />
                                <Text style={[styles.teamName, { color: theme.colors.primary }]}>{job.teamName}</Text>
                                <View style={{ flex: 1 }} />
                                <ChevronRight size={16} color={theme.colors.cardBorder} />
                            </View>
                        </TouchableOpacity>
                    ))
                ) : (
                    groupedJobs.map(([date, jobs]) => (
                        <View key={date} style={styles.dateGroup}>
                            <View style={styles.dateHeader}>
                                <View style={[styles.dateDot, { backgroundColor: theme.colors.primary }]} />
                                <Text style={[styles.dateLabel, { color: theme.colors.text }]}>{date}</Text>
                            </View>
                            <View style={styles.dateLine} />
                            {jobs.map(job => (
                                <View key={job.id} style={styles.timelineItem}>
                                    <View style={[styles.timelineTime, { borderRightColor: theme.colors.cardBorder }]}>
                                        <Text style={[styles.timeText, { color: theme.colors.text }]}>
                                            {new Date(job.start).toLocaleTimeString(i18n.language === 'tr' ? 'tr-TR' : 'en-US', { hour: '2-digit', minute: '2-digit' })}
                                        </Text>
                                    </View>
                                    <TouchableOpacity style={[styles.timelineCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                                        <Text style={[styles.timelineTitle, { color: theme.colors.text }]} numberOfLines={1}>{job.title}</Text>
                                        <View style={styles.timelineFooter}>
                                            <Text style={[styles.timelineSubtext, { color: theme.colors.subText }]} numberOfLines={1}>{job.teamName}</Text>
                                            {renderStatusBadge(job.status)}
                                        </View>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    ))
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { paddingVertical: 12, borderBottomWidth: 1 },
    viewToggle: { flexDirection: 'row', marginHorizontal: 16, marginBottom: 12, backgroundColor: 'rgba(107, 114, 128, 0.1)', borderRadius: 12, padding: 4 },
    toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: 10, gap: 8 },
    toggleText: { fontSize: 13, fontWeight: '600' },
    filterScroll: { paddingHorizontal: 16, gap: 8 },
    filterItem: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 },
    filterText: { fontSize: 13, fontWeight: '600' },
    scrollContent: { padding: 16 },
    jobCard: { borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, elevation: 2 },
    jobHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    jobTitle: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 10, fontWeight: 'bold' },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
    infoText: { fontSize: 13 },
    teamFooter: { marginTop: 8, paddingTop: 12, borderTopWidth: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
    teamName: { fontSize: 13, fontWeight: '600' },
    emptyContainer: { alignItems: 'center', marginTop: 80, gap: 16 },
    emptyText: { fontSize: 16, fontStyle: 'italic' },
    dateGroup: { marginBottom: 24 },
    dateHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
    dateDot: { width: 10, height: 10, borderRadius: 5 },
    dateLabel: { fontSize: 16, fontWeight: 'bold' },
    dateLine: { position: 'absolute', left: 4, top: 24, bottom: -24, width: 2, backgroundColor: 'rgba(107, 114, 128, 0.1)', zIndex: -1 },
    timelineItem: { flexDirection: 'row', gap: 12, marginBottom: 12, paddingLeft: 12 },
    timelineTime: { width: 60, paddingRight: 12, borderRightWidth: 1, justifyContent: 'center' },
    timeText: { fontSize: 12, fontWeight: '600', textAlign: 'right' },
    timelineCard: { flex: 1, borderRadius: 12, padding: 12, borderWidth: 1 },
    timelineTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
    timelineFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    timelineSubtext: { fontSize: 11, flex: 1, marginRight: 8 },
});

export default AdvancedPlanningScreen;