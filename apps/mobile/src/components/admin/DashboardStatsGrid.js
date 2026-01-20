import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import StatCard from '../StatCard';
import { useTheme } from '../../context/ThemeContext';

const DashboardStatsGrid = ({ statsData }) => {
    const { theme } = useTheme();

    const stats = [
        {
            title: 'Toplam İş',
            value: (statsData?.totalJobs || 0).toString(),
            icon: 'work',
            color: theme.colors.primary,
        },
        {
            title: 'Aktif Ekipler',
            value: (statsData?.activeTeams || 0).toString(),
            icon: 'groups',
            color: '#3b82f6', // Keep semantic colors distinct if needed, or map to theme.secondary
        },
        {
            title: 'Tamamlanan',
            value: (statsData?.completedJobs || 0).toString(),
            icon: 'check-circle',
            color: '#22c55e',
        },
        {
            title: 'Bekleyen',
            value: (statsData?.pendingJobs || 0).toString(),
            icon: 'access-time',
            color: '#f59e0b',
        }
    ];

    return (
        <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Genel Durum</Text>
            <View style={styles.statsGrid}>
                {stats.map((stat, index) => (
                    <StatCard
                        key={index}
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
