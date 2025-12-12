import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../../constants/theme';
import { CATEGORIES } from './ExpenseFilter';

export const ExpenseList = ({ groupedExpenses, filteredExpensesCount }) => {
    const getStatusColor = (status) => {
        switch (status) {
            case 'APPROVED': return COLORS.green500;
            case 'PENDING': return COLORS.orange500;
            case 'REJECTED': return COLORS.red500;
            default: return COLORS.textGray;
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

    const getIconBgColor = () => {
        return 'rgba(148, 163, 184, 0.1)';
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
                        <Text style={styles.dateHeader}>{groupName}</Text>
                        {groupExpenses.map((expense) => (
                            <View key={expense.id} style={styles.expenseCard}>
                                <View style={[styles.expenseIconCircle, { backgroundColor: getIconBgColor() }]}>
                                    <MaterialIcons name={getCategoryIcon(expense.category)} size={24} color={COLORS.textLight} />
                                </View>
                                <View style={styles.expenseInfo}>
                                    <Text style={styles.expenseTitle}>{expense.description || expense.category}</Text>
                                    <Text style={styles.expenseDate}>{new Date(expense.date).toLocaleDateString('tr-TR')}</Text>
                                    {expense.job?.title && <Text style={{ fontSize: 12, color: COLORS.textGray }}>{expense.job.title}</Text>}
                                </View>
                                <View style={styles.expenseAmountContainer}>
                                    <Text style={styles.expenseAmount}>₺{expense.amount}</Text>
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
                <Text style={styles.emptyText}>Masraf bulunamadı.</Text>
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
        backgroundColor: COLORS.cardDark,
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
