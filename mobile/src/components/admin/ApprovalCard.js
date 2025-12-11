import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

const ApprovalCard = ({ item, onApprove, onReject }) => {
    return (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <View style={[styles.typeBadge, { backgroundColor: item.type === 'JOB' ? 'rgba(57, 255, 20, 0.1)' : 'rgba(255, 165, 0, 0.1)' }]}>
                    <MaterialIcons
                        name={item.type === 'JOB' ? 'work' : 'receipt'}
                        size={16}
                        color={item.type === 'JOB' ? COLORS.primary : '#FFA500'}
                    />
                    <Text style={[styles.typeText, { color: item.type === 'JOB' ? COLORS.primary : '#FFA500' }]}>
                        {item.type === 'JOB' ? 'İŞ ONAYI' : 'MASRAF ONAYI'}
                    </Text>
                </View>
                <Text style={styles.dateText}>{item.date}</Text>
            </View>

            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.requester}>Talep Eden: {item.requester}</Text>

            <View style={styles.actions}>
                <TouchableOpacity
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => onReject(item)}
                >
                    <MaterialIcons name="close" size={20} color={COLORS.red500} />
                    <Text style={styles.rejectText}>Reddet</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => onApprove(item)}
                >
                    <MaterialIcons name="check" size={20} color={COLORS.black} />
                    <Text style={styles.approveText}>Onayla</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: COLORS.cardDark,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: COLORS.slate800,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    typeBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        gap: 4,
    },
    typeText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    dateText: {
        color: COLORS.slate400,
        fontSize: 12,
    },
    title: {
        color: COLORS.textLight,
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    requester: {
        color: COLORS.slate400,
        fontSize: 14,
        marginBottom: 16,
    },
    actions: {
        flexDirection: 'row',
        gap: 12,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 12,
        borderRadius: 8,
        gap: 8,
    },
    rejectButton: {
        backgroundColor: 'rgba(255, 68, 68, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(255, 68, 68, 0.3)',
    },
    approveButton: {
        backgroundColor: COLORS.primary,
    },
    rejectText: {
        color: COLORS.red500,
        fontWeight: '600',
    },
    approveText: {
        color: COLORS.black,
        fontWeight: 'bold',
    },
});

export default ApprovalCard;
