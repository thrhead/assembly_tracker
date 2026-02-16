import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    ActivityIndicator,
    ScrollView,
    RefreshControl
} from 'react-native';
import { User, ShieldCheck, Mail, Award, Target, ChevronLeft } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const TeamDetailScreen = ({ route, navigation }) => {
    const { theme, isDark } = useTheme();
    const { t } = useTranslation();
    const { teamId, teamName } = route.params;
    const [team, setTeam] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchTeamDetails = async () => {
        try {
            const response = await api.get(`/api/admin/teams/${teamId}`);
            setTeam(response.data);
        } catch (error) {
            console.error('Fetch team details error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        fetchTeamDetails();
    }, []);

    const onRefresh = () => {
        setRefreshing(true);
        fetchTeamDetails();
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <View style={[styles.scoreCard, { backgroundColor: theme.colors.primary }]}>
                <Award size={32} color={isDark ? '#000' : '#FFF'} />
                <View>
                    <Text style={[styles.scoreTitle, { color: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)' }]}>{t('manager.performanceScore')}</Text>
                    <Text style={[styles.scoreValue, { color: isDark ? '#000' : '#FFF' }]}>%{team?.performanceScore || 0}</Text>
                </View>
            </View>

            <View style={styles.statsContainer}>
                <View style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                    <Target size={20} color={theme.colors.primary} />
                    <Text style={[styles.statLabel, { color: theme.colors.subText }]}>{t('manager.totalJobs')}</Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{team?.stats?.totalJobs || 0}</Text>
                </View>
                <View style={[styles.statBox, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
                    <ShieldCheck size={20} color="#22C55E" />
                    <Text style={[styles.statLabel, { color: theme.colors.subText }]}>{t('manager.completedJobs')}</Text>
                    <Text style={[styles.statValue, { color: theme.colors.text }]}>{team?.stats?.completedJobs || 0}</Text>
                </View>
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('manager.teamMembers')}</Text>
        </View>
    );

    const renderMemberItem = ({ item }) => (
        <View style={[styles.memberCard, { backgroundColor: theme.colors.card, borderColor: theme.colors.cardBorder }]}>
            <View style={styles.memberInfo}>
                {item.user.avatarUrl ? (
                    <Image 
                        source={{ uri: item.user.avatarUrl }} 
                        style={styles.avatar} 
                        accessibilityLabel={`${item.user.name}'s avatar`}
                    />
                ) : (
                    <View style={[styles.avatarPlaceholder, { backgroundColor: theme.colors.background }]}>
                        <User size={24} color={theme.colors.subText} />
                    </View>
                )}
                <View style={{ flex: 1 }}>
                    <View style={styles.nameRow}>
                        <Text style={[styles.memberName, { color: theme.colors.text }]}>{item.user.name}</Text>
                        {item.role === 'TEAM_LEAD' || item.isLead ? (
                            <View style={styles.leadBadge}>
                                <ShieldCheck size={10} color="#FFF" />
                                <Text style={styles.leadText}>{t('manager.leader')}</Text>
                            </View>
                        ) : null}
                    </View>
                    <View style={styles.emailRow}>
                        <Mail size={14} color={theme.colors.subText} />
                        <Text style={[styles.memberEmail, { color: theme.colors.subText }]} numberOfLines={1}>
                            {item.user.email}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    if (loading && !refreshing) {
        return (
            <View style={[styles.centered, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                data={team?.members || []}
                renderItem={renderMemberItem}
                keyExtractor={item => item.user.id}
                ListHeaderComponent={renderHeader}
                contentContainerStyle={styles.listContent}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={[styles.emptyText, { color: theme.colors.subText }]}>{t('manager.noMembers')}</Text>
                    </View>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { marginBottom: 20 },
    scoreCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderRadius: 16,
        gap: 16,
        marginBottom: 16,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    scoreTitle: { fontSize: 13, fontWeight: '600' },
    scoreValue: { fontSize: 32, fontWeight: 'bold' },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 24,
    },
    statBox: {
        flex: 1,
        padding: 16,
        borderRadius: 16,
        alignItems: 'center',
        gap: 6,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    statLabel: { fontSize: 11, fontWeight: '600' },
    statValue: { fontSize: 20, fontWeight: 'bold' },
    sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
    listContent: { padding: 16, paddingBottom: 40 },
    memberCard: {
        padding: 12,
        borderRadius: 16,
        marginBottom: 10,
        borderWidth: 1,
        elevation: 1,
    },
    memberInfo: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    avatar: { width: 48, height: 48, borderRadius: 24 },
    avatarPlaceholder: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
    memberName: { fontSize: 16, fontWeight: '600' },
    leadBadge: {
        backgroundColor: '#F59E0B',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 6,
        gap: 4,
    },
    leadText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    emailRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 },
    memberEmail: { fontSize: 13, flex: 1 },
    emptyContainer: { alignItems: 'center', marginTop: 40 },
    emptyText: { fontSize: 14, fontStyle: 'italic' },
});

export default TeamDetailScreen;