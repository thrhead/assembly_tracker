import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import StatCard from '../StatCard';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const DashboardStatsGrid = ({ statsData }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const generalStats = [
        {
            title: t('admin.stats.totalJobs'),
            value: (statsData?.totalJobs || 0).toString(),
            icon: 'work',
            color: theme.colors.primary,
        },
        {
            title: t('admin.stats.activeTeams'),
            value: (statsData?.activeTeams || 0).toString(),
            icon: 'groups',
            color: '#3b82f6',
        }
    ];

    const costStats = [
        {
            title: t('admin.stats.todayCost') || 'Bugün Harcanan',
            value: `₺${(statsData?.totalCostToday || 0).toLocaleString('tr-TR')}`,
            icon: 'account-balance-wallet',
            color: '#22c55e',
        },
        {
            title: t('admin.stats.pendingCost') || 'Bekleyen',
            value: `₺${(statsData?.totalPendingCost || 0).toLocaleString('tr-TR')}`,
            icon: 'pause-circle-filled',
            color: '#f59e0b',
        },
        {
            title: t('admin.stats.approvedCost') || 'Onaylanan',
            value: `₺${(statsData?.totalApprovedCost || 0).toLocaleString('tr-TR')}`,
            icon: 'check-circle',
            color: '#10b981',
        }
    ];

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.info')}</Text>
            <View style={styles.statsGrid}>
                {generalStats.map((stat) => (
                    <StatCard
                        key={stat.title}
                        label={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        iconColor={stat.color}
                        style={styles.statCard}
                    />
                ))}
            </View>

            <Text style={[styles.sectionTitle, { color: theme.colors.text, marginTop: 12 }]}>Maliyet Özet</Text>
            <View style={styles.statsGrid}>
                {costStats.map((stat, idx) => (
                    <StatCard
                        key={stat.title}
                        label={stat.title}
                        value={stat.value}
                        icon={stat.icon}
                        iconColor={stat.color}
                        style={[styles.statCard, idx === 0 && { width: '100%' }]}
                    />
                ))}
            </View>

            {/* Budget Progress Bar */}
            <View style={[styles.budgetContainer, { borderColor: theme.colors.cardBorder, backgroundColor: theme.colors.card }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: theme.colors.subText, fontSize: 12, fontWeight: '600' }}>GÜNLÜK BÜTÇE KULLANIMI</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 12, fontWeight: 'bold' }}>%{statsData?.budgetPercentage || 0}</Text>
                </View>
                <View style={[styles.progressBg, { backgroundColor: theme.colors.cardBorder }]}>
                    <View
                        style={[
                            styles.progressFill,
                            {
                                width: `${statsData?.budgetPercentage || 0}%`,
                                backgroundColor: theme.colors.primary
                            }
                        ]}
                    />
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    section: {
        padding: 16,
        paddingTop: 4,
        gap: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 8,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    statCard: {
        width: '47%',
        marginBottom: 0,
    },
    budgetContainer: {
        marginTop: 16,
        padding: 16,
        borderRadius: 20,
        borderWidth: 1,
    },
    progressBg: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        borderRadius: 4,
    },
});

export default DashboardStatsGrid;
