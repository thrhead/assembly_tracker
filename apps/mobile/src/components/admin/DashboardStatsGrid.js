import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import StatCard from '../StatCard';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const DashboardStatsGrid = ({ statsData }) => {
    const { theme } = useTheme();
    const { t } = useTranslation();

    const stats = [
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
            color: '#3b82f6', // Keep semantic colors distinct if needed, or map to theme.secondary
        },
        {
            title: t('admin.stats.completedJobs'),
            value: (statsData?.completedJobs || 0).toString(),
            icon: 'check-circle',
            color: '#22c55e',
        },
        {
            title: t('admin.stats.pendingJobs'),
            value: (statsData?.pendingJobs || 0).toString(),
            icon: 'access-time',
            color: '#f59e0b',
        }
    ];

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('common.info')}</Text>
            <View style={styles.statsGrid}>
                {stats.map((stat) => (
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
});

export default DashboardStatsGrid;
