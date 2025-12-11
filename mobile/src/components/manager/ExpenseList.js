import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { getStatusColor, getStatusLabel } from '../../utils/status-helper';
import { getCategoryColor, getCategoryIcon } from '../../utils/cost-helper';

const ExpenseList = ({ costs, loading }) => {
    if (loading) return null;

    if (costs.length === 0) {
        return (
            <View style={styles.emptyState}>
                <MaterialIcons name="receipt-long" size={64} color={COLORS.slate600} />
                <Text style={styles.emptyText}>Masraf bulunamadı</Text>
            </View>
        );
    }

    const groupCostsByDate = () => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const groups = {
            today: [],
            yesterday: [],
            older: []
        };

        costs.forEach(cost => {
            const costDate = new Date(cost.date || cost.createdAt);
            costDate.setHours(0, 0, 0, 0);

            if (costDate.getTime() === today.getTime()) {
                groups.today.push(cost);
            } else if (costDate.getTime() === yesterday.getTime()) {
                groups.yesterday.push(cost);
            } else {
                groups.older.push(cost);
            }
        });

        return groups;
    };

    const renderCostItem = (item) => {
        const categoryColor = getCategoryColor(item.category);
        const statusColor = getStatusColor(item.status);

        return (
            <View key={item.id} style={styles.expenseCard}>
                <View style={[styles.categoryIcon, { backgroundColor: categoryColor + '40' }]}>
                    <MaterialIcons name={getCategoryIcon(item.category)} size={24} color={categoryColor} />
                </View>
                <View style={styles.expenseContent}>
                    <Text style={styles.expenseTitle}>{item.description || 'Masraf'}</Text>
                    <Text style={styles.expenseDate}>
                        {new Date(item.date || item.createdAt).toLocaleDateString('tr-TR')}
                    </Text>
                    <Text style={styles.expenseUser}>
                        {item.createdBy?.name || 'Bilinmeyen'}
                    </Text>
                </View>
                <View style={styles.expenseRight}>
                    <Text style={styles.expenseAmount}>₺{parseFloat(item.amount || 0).toFixed(2)}</Text>
                    <View style={styles.statusContainer}>
                        <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
                        <Text style={[styles.statusText, { color: statusColor }]}>{getStatusLabel(item.status)}</Text>
                    </View>
                </View>
            </View>
        );
    };

    const groupedCosts = groupCostsByDate();

    return (
        <View>
            {groupedCosts.today.length > 0 && (
                <>
                    <Text style={styles.dateHeader}>Bugün</Text>
                    {groupedCosts.today.map(renderCostItem)}
                </>
            )}

            {groupedCosts.yesterday.length > 0 && (
                <>
                    <Text style={styles.dateHeader}>Dün</Text>
                    {groupedCosts.yesterday.map(renderCostItem)}
                </>
            )}

            {groupedCosts.older.length > 0 && (
                <>
                    <Text style={styles.dateHeader}>Daha Eski</Text>
                    {groupedCosts.older.map(renderCostItem)}
                </>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
    },
    emptyText: {
        fontSize: 16,
        color: COLORS.slate500,
        marginTop: 16,
    },
    dateHeader: {
        fontSize: 14,
        fontWeight: '500',
        color: COLORS.slate400,
        paddingHorizontal: 20,
        marginTop: 12,
        marginBottom: 12,
    },
    expenseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.cardDark,
        borderWidth: 1,
        borderColor: COLORS.slate800,
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginBottom: 12,
    },
    categoryIcon: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16,
    },
    expenseContent: {
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
        color: COLORS.slate400,
        marginBottom: 2,
    },
    expenseUser: {
        fontSize: 12,
        color: COLORS.slate500,
    },
    expenseRight: {
        alignItems: 'flex-end',
    },
    expenseAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 8,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '500',
    },
});

export default ExpenseList;
