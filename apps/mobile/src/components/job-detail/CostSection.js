import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import GlassCard from '../ui/GlassCard';

const CostSection = ({ job, canAdd, onAddPress }) => {
    const { theme } = useTheme();

    if (!job) return null;

    return (
        <View>
            <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Masraflar</Text>
                {canAdd && (
                    <TouchableOpacity
                        style={[styles.addCostButton, { backgroundColor: theme.colors.primary }]}
                        onPress={onAddPress}
                    >
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.addCostButtonText}>Ekle</Text>
                    </TouchableOpacity>
                )}
            </View>

            {job.costs && job.costs.length > 0 ? (
                job.costs.map((cost) => (
                    <GlassCard key={cost.id} style={styles.costCard} theme={theme}>
                        <View style={styles.costHeader}>
                            <Text style={[styles.costCategory, { color: theme.colors.primary }]}>{cost.category}</Text>
                            <Text style={[
                                styles.costStatus,
                                {
                                    color: cost.status === 'APPROVED' ? theme.colors.success :
                                        cost.status === 'REJECTED' ? theme.colors.error : theme.colors.warning
                                }
                            ]}>
                                {cost.status === 'APPROVED' ? 'Onaylandı' :
                                    cost.status === 'REJECTED' ? 'Reddedildi' : 'Bekliyor'}
                            </Text>
                        </View>
                        <View style={styles.costRow}>
                            <Text style={[styles.costAmount, { color: theme.colors.text }]}>{cost.amount} {cost.currency}</Text>
                            <Text style={[styles.costDate, { color: theme.colors.subText }]}>{new Date(cost.date).toLocaleDateString()}</Text>
                        </View>
                        <Text style={[styles.costDescription, { color: theme.colors.subText }]}>{cost.description}</Text>
                        {cost.rejectionReason && (
                            <Text style={[styles.rejectionReason, { color: theme.colors.error }]}>Red Nedeni: {cost.rejectionReason}</Text>
                        )}
                    </GlassCard>
                ))
            ) : (
                <Text style={[styles.emptyText, { color: theme.colors.subText }]}>Henüz masraf eklenmemiş.</Text>
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
        marginBottom: 12,
        marginTop: 8,
    },
    addCostButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
    },
    addCostButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 4,
    },
    costCard: {
        padding: 16,
        marginBottom: 12,
    },
    costHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    costCategory: {
        fontWeight: '600',
    },
    costStatus: {
        fontSize: 12,
        fontWeight: '600',
    },
    costRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    costAmount: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    costDate: {
    },
    costDescription: {
        fontSize: 14,
    },
    rejectionReason: {
        marginTop: 4,
        fontSize: 12,
    },
    emptyText: {
        textAlign: 'center',
        marginTop: 20,
        fontStyle: 'italic',
    },
});

export default CostSection;
