import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import StatCard from '../StatCard';
import { COLORS } from '../../constants/theme';

const DashboardStatsGrid = ({ statsData }) => {
    const stats = [
        {
            title: 'Toplam İş',
            value: (statsData?.totalJobs || 0).toString(),
            icon: 'work',
            color: COLORS.primary,
        },
        {
            title: 'Aktif Ekipler',
            value: (statsData?.activeTeams || 0).toString(),
            icon: 'groups',
            color: COLORS.blue500,
        },
        {
            title: 'Tamamlanan',
            value: (statsData?.completedJobs || 0).toString(),
            icon: 'check-circle',
            color: COLORS.green500,
        },
        {
            title: 'Bekleyen',
            value: (statsData?.pendingJobs || 0).toString(),
            icon: 'access-time',
            color: COLORS.amber500,
        }
    ];

    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>Genel Durum</Text>
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
        color: COLORS.textLight,
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
