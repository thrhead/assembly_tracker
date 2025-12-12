import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../../constants/theme';

export const ExpenseSummary = ({ totalAmount }) => {
    return (
        <View style={styles.budgetCard}>
            <View style={styles.budgetHeader}>
                <Text style={styles.budgetTitle}>Toplam Harcama</Text>
                <Text style={styles.budgetAmount}>
                    ₺{totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    budgetCard: {
        margin: 16,
        marginTop: 0,
        padding: 20,
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    budgetHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    budgetTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textLight,
    },
    budgetAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
});
