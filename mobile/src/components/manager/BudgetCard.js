import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const BudgetCard = ({ stats }) => {
    const progress = stats.total > 0 ? Math.min((stats.used / stats.total) * 100, 100) : 0;

    return (
        <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
                <Text style={styles.budgetLabel}>Toplam Kullanılan Bütçe</Text>
                <Text style={styles.budgetAmount}>₺{stats.used.toFixed(2)}</Text>
            </View>
            <View style={styles.progressBar}>
                <View
                    style={[styles.progressFill, { width: `${progress}%` }]}
                />
            </View>
            <View style={styles.budgetFooter}>
                <Text style={styles.budgetSecondary}>₺{stats.remaining.toFixed(2)} Kalan</Text>
                <Text style={styles.budgetSecondary}>₺{stats.total.toFixed(2)} Toplam</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    budgetCard: {
        margin: 16,
        padding: 20,
        borderRadius: 12,
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    budgetLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textLight,
    },
    budgetAmount: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        backgroundColor: COLORS.slate700,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
        backgroundColor: COLORS.primary,
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetSecondary: {
        fontSize: 14,
        color: COLORS.slate400,
    },
});

export default BudgetCard;
