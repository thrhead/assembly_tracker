import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

const renderPriorityDot = (priority) => {
    let color = COLORS.blue500;
    if (priority === 'HIGH') color = COLORS.red500;
    if (priority === 'MEDIUM') color = COLORS.orange500;
    return <View style={[styles.priorityDot, { backgroundColor: color }]} />;
};

const renderStatusBadge = (status) => {
    if (status === 'IN_PROGRESS') {
        return (
            <View style={[styles.badge, { backgroundColor: 'rgba(57, 255, 20, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: COLORS.neonGreen }]}>Devam Ediyor</Text>
            </View>
        );
    }
    if (status === 'PENDING') {
        return (
            <View style={[styles.badge, { backgroundColor: 'rgba(30, 58, 138, 0.5)' }]}>
                <Text style={[styles.badgeText, { color: '#60a5fa' }]}>Bekliyor</Text>
            </View>
        );
    }
    if (status === 'COMPLETED') {
        return (
            <View style={[styles.badge, { backgroundColor: 'rgba(57, 255, 20, 0.1)' }]}>
                <Text style={[styles.badgeText, { color: 'rgba(57, 255, 20, 0.8)' }]}>Tamamlandı</Text>
            </View>
        );
    }
    return null;
};

const JobListItem = ({ item, onPress }) => {
    return (
        <View style={[
            styles.card,
            item.status === 'IN_PROGRESS' && styles.cardActive,
            item.status === 'COMPLETED' && styles.cardCompleted
        ]}>
            <View style={styles.cardContent}>
                <View style={styles.cardHeader}>
                    <Text style={[styles.cardTitle, item.status === 'COMPLETED' && styles.textStrike]}>{item.title}</Text>
                    <View style={styles.headerRight}>
                        {item.status !== 'COMPLETED' && renderPriorityDot(item.priority)}
                        {renderStatusBadge(item.status)}
                    </View>
                </View>
                <View style={styles.cardFooter}>
                    <View style={styles.footerInfo}>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="event" size={16} color={COLORS.neonGreen} />
                            <Text style={styles.infoText}>{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : 'Tarih Yok'}</Text>
                        </View>
                        <View style={styles.infoRow}>
                            <MaterialIcons name="person" size={16} color={COLORS.neonGreen} />
                            <Text style={styles.infoText}>
                                Atanan: {item.assignments?.[0]?.team?.name || item.assignments?.[0]?.worker?.name || item.assignee?.name || 'Atanmamış'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={styles.detailsButton}
                        onPress={() => onPress(item)}
                    >
                        <Text style={styles.detailsButtonText}>Detaylar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    card: { backgroundColor: COLORS.cardDark, borderRadius: 12, borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: 16, overflow: 'hidden' },
    cardActive: { borderColor: 'rgba(57, 255, 20, 0.5)', shadowColor: COLORS.neonGreen, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
    cardCompleted: { opacity: 0.6 },
    cardContent: { padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: COLORS.textLight, flex: 1, marginRight: 8, lineHeight: 24 },
    textStrike: { textDecorationLine: 'line-through' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    priorityDot: { width: 12, height: 12, borderRadius: 6 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
    badgeText: { fontSize: 12, fontWeight: '500' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
    footerInfo: { gap: 4 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    infoText: { fontSize: 14, color: COLORS.textGray },
    detailsButton: { backgroundColor: COLORS.neonGreen, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, minWidth: 84, alignItems: 'center' },
    detailsButtonText: { color: COLORS.black, fontSize: 14, fontWeight: '500' },
});

export default memo(JobListItem);
