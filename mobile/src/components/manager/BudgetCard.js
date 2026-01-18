import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const BudgetCard = ({ stats, theme }) => {
    const colors = theme ? theme.colors : COLORS;
    const progress = stats.total > 0 ? Math.min((stats.used / stats.total) * 100, 100) : 0;

    return (
        <View style={[styles.budgetCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.budgetHeader}>
                <Text style={[styles.budgetLabel, { color: colors.text }]}>Toplam Kullanılan Bütçe</Text>
                <Text style={[styles.budgetAmount, { color: colors.text }]}>₺{stats.used.toFixed(2)}</Text>
            </View>
            <View style={[styles.progressBar, { backgroundColor: colors.surface }]}>
                <View
                    style={[styles.progressFill, { width: `${progress}%`, backgroundColor: colors.primary }]}
                />
            </View>
            <View style={styles.budgetFooter}>
                <Text style={[styles.budgetSecondary, { color: colors.subText }]}>₺{stats.remaining.toFixed(2)} Kalan</Text>
                <Text style={[styles.budgetSecondary, { color: colors.subText }]}>₺{stats.total.toFixed(2)} Toplam</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    budgetCard: {
        margin: 16,
        padding: 20,
        borderRadius: 12,
        borderWidth: 1,
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
    },
    budgetAmount: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    progressBar: {
        height: 8,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: 12,
    },
    progressFill: {
        height: '100%',
    },
    budgetFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    budgetSecondary: {
        fontSize: 14,
    },
});

export default BudgetCard;
