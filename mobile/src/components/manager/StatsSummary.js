import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import StatCard from '../StatCard';
import { COLORS } from '../../constants/theme';

const StatsSummary = ({ stats }) => {
    return (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statsContainer}>
            <StatCard
                label="Toplam Gelir"
                value={`₺${stats.totalRevenue.toLocaleString()}`}
                icon="attach-money"
                iconColor={COLORS.green500}
                style={styles.statCard}
            />
            <StatCard
                label="Aktif İşler"
                value={stats.active.toString()}
                icon="work"
                iconColor={COLORS.blue500}
                style={styles.statCard}
            />
            <StatCard
                label="Tamamlanan"
                value={stats.completed.toString()}
                icon="check-circle"
                iconColor={COLORS.primary}
                style={styles.statCard}
            />
            <StatCard
                label="Bekleyen"
                value={stats.pending.toString()}
                icon="pending"
                iconColor={COLORS.amber500}
                style={styles.statCard}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    statsContainer: {
        paddingVertical: 16,
        paddingHorizontal: 12,
    },
    statCard: {
        minWidth: 140,
        marginHorizontal: 4,
    },
});

export default StatsSummary;
