import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const CostSection = ({ job, canAdd, onAddPress }) => {
    if (!job) return null;

    return (
        <View>
            <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Masraflar</Text>
                {canAdd && (
                    <TouchableOpacity
                        style={styles.addCostButton}
                        onPress={onAddPress}
                    >
                        <MaterialIcons name="add" size={20} color={COLORS.black} />
                        <Text style={styles.addCostButtonText}>Ekle</Text>
                    </TouchableOpacity>
                )}
            </View>

            {job.costs && job.costs.length > 0 ? (
                job.costs.map((cost) => (
                    <View key={cost.id} style={styles.costCard}>
                        <View style={styles.costHeader}>
                            <Text style={styles.costCategory}>{cost.category}</Text>
                            <Text style={[
                                styles.costStatus,
                                cost.status === 'APPROVED' ? styles.statusApproved :
                                    cost.status === 'REJECTED' ? styles.statusRejected : styles.statusPending
                            ]}>
                                {cost.status === 'APPROVED' ? 'Onaylandı' :
                                    cost.status === 'REJECTED' ? 'Reddedildi' : 'Bekliyor'}
                            </Text>
                        </View>
                        <View style={styles.costRow}>
                            <Text style={styles.costAmount}>{cost.amount} {cost.currency}</Text>
                            <Text style={styles.costDate}>{new Date(cost.date).toLocaleDateString()}</Text>
                        </View>
                        <Text style={styles.costDescription}>{cost.description}</Text>
                        {cost.rejectionReason && (
                            <Text style={styles.rejectionReason}>Red Nedeni: {cost.rejectionReason}</Text>
                        )}
                    </View>
                ))
            ) : (
                <Text style={styles.emptyText}>Henüz masraf eklenmemiş.</Text>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    sectionHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
        marginBottom: 12,
        marginTop: 8,
    },
    addCostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primary,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addCostButtonText: {
        color: COLORS.black,
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 4,
    },
    costCard: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: COLORS.cardBorder,
    },
    costHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    costCategory: {
        color: COLORS.primary,
        fontWeight: '600',
    },
    costStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    statusApproved: { color: COLORS.green500 },
    statusRejected: { color: COLORS.red500 },
    statusPending: { color: COLORS.blue500 },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    costAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: COLORS.textLight,
    },
    costDate: {
        color: COLORS.textGray,
    },
    costDescription: {
        color: COLORS.textGray,
        fontSize: 14,
    },
    rejectionReason: {
        color: COLORS.red500,
        marginTop: 4,
        fontSize: 12,
    },
    emptyText: {
        color: COLORS.textGray,
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
});

export default CostSection;
