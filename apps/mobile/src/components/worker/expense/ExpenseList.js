import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { CATEGORIES } from './ExpenseFilter';

export const ExpenseList = ({ groupedExpenses, filteredExpensesCount, theme }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return theme.colors.success;
            case 'PENDING': return theme.colors.warning;
            case 'REJECTED': return theme.colors.error;
            default: return theme.colors.subText;
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'APPROVED': return 'Onaylandı';
            case 'PENDING': return 'Bekliyor';
            case 'REJECTED': return 'Reddedildi';
            default: return '';
        }
    };

    const getCategoryIcon = (category) => {
        const cat = CATEGORIES.find(c => c.id === category);
        return cat ? cat.icon : 'attach-money';
    };

    return (
        <View style={styles.expensesList}>
            {Object.entries(groupedExpenses).map(([groupName, groupExpenses]) => (
                groupExpenses.length > 0 && (
                    <View key={groupName}>
                        <Text style={[styles.dateHeader, { color: theme.colors.subText }]}>{groupName}</Text>
                        {groupExpenses.map((expense) => (
                            <View key={expense.id} style={[
                                styles.expenseCard,
                                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }
                            ]}>
                                <View style={[
                                    styles.expenseIconCircle,
                                    { backgroundColor: theme.colors.background }
                                ]}>
                                    <MaterialIcons name={getCategoryIcon(expense.category)} size={24} color={theme.colors.text} />
                                </View>
                                <View style={styles.expenseInfo}>
                                    <Text style={[styles.expenseTitle, { color: theme.colors.text }]}>{expense.description || expense.category}</Text>
                                    <Text style={[styles.expenseDate, { color: theme.colors.subText }]}>{new Date(expense.date).toLocaleDateString('tr-TR')}</Text>
                                    {expense.job?.title && <Text style={{ fontSize: 12, color: theme.colors.subText }}>{expense.job.title}</Text>}
                                </View>
                                <View style={styles.expenseAmountContainer}>
                                    <Text style={[styles.expenseAmount, { color: theme.colors.text }]}>₺{expense.amount}</Text>
                                    <View style={styles.statusContainer}>
                                        <View style={[styles.statusDot, { backgroundColor: getStatusColor(expense.status) }]} />
                                        <Text style={[styles.statusText, { color: getStatusColor(expense.status) }]}>
                                            {getStatusText(expense.status)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        ))}
                    </View>
                )
            ))}
            {filteredExpensesCount === 0 && (
                <Text style={[styles.emptyText, { color: theme.colors.subText }]}>Masraf bulunamadı.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    expensesList: {
        paddingHorizontal: 16,
    },
    dateHeader: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.textGray,
        marginBottom: 12,
        marginLeft: 4,
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.card,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
        marginBottom: 12,
    },
    expenseIconCircle: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    expenseInfo: {
        flex: 1,
    },
    expenseTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    expenseDate: {
        fontSize: 14,
        color: COLORS.textGray,
    },
    expenseAmountContainer: {
        alignItems: 'flex-end',
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 4,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 4,
    },
    statusText: {
        fontSize: 12,
    },
    emptyText: {
        color: COLORS.textGray,
        textAlign: 'center',
        marginTop: 20
    }
});
