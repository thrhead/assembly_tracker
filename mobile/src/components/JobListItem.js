import React, { memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const renderPriorityDot = (priority, theme) => {
    let color = theme.colors.tertiary; // Default or Low
    if (priority === 'HIGH') color = '#ef4444'; // Red-500
    if (priority === 'MEDIUM') color = '#f97316'; // Orange-500
    if (priority === 'LOW') color = '#3b82f6'; // Blue-500
    return <View style={[styles.priorityDot, { backgroundColor: color }]} />;
};

const renderStatusBadge = (status, theme, isDark) => {
    if (status === 'IN_PROGRESS' || status === 'In Progress') {
        const bgColor = isDark ? 'rgba(57, 255, 20, 0.1)' : 'rgba(37, 99, 235, 0.1)';
        const textColor = isDark ? '#39FF14' : theme.colors.primary;
        return (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>Devam Ediyor</Text>
            </View>
        );
    }
    if (status === 'PENDING' || status === 'Pending') {
        const bgColor = isDark ? 'rgba(30, 58, 138, 0.5)' : 'rgba(245, 158, 11, 0.1)';
        const textColor = isDark ? '#60a5fa' : '#d97706';
        return (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>Bekliyor</Text>
            </View>
        );
    }
    if (status === 'COMPLETED' || status === 'Completed') {
        const bgColor = isDark ? 'rgba(57, 255, 20, 0.1)' : 'rgba(34, 197, 94, 0.1)';
        const textColor = isDark ? '#39FF14' : '#15803d';
        return (
            <View style={[styles.badge, { backgroundColor: bgColor }]}>
                <Text style={[styles.badgeText, { color: textColor }]}>Tamamlandı</Text>
            </View>
        );
    }
    return null;
};

const JobListItem = ({ item, onPress }) => {
    const { theme, isDark } = useTheme();

    return (
        <TouchableOpacity
            onPress={() => onPress(item)}
            activeOpacity={0.7}
        >
            <View style={[
                styles.card,
                {
                    backgroundColor: theme.colors.card,
                    borderColor: theme.colors.cardBorder
                },
                item.status === 'IN_PROGRESS' && { borderColor: theme.colors.primary, borderWidth: 1 },
                item.status === 'COMPLETED' && styles.cardCompleted
            ]}>
                <View style={styles.cardContent}>
                    <View style={styles.cardHeader}>
                        <Text style={[styles.cardTitle, { color: theme.colors.text }, item.status === 'COMPLETED' && styles.textStrike]}>{item.title}</Text>
                        <View style={styles.headerRight}>
                            {item.status !== 'COMPLETED' && renderPriorityDot(item.priority, theme)}
                            {renderStatusBadge(item.status, theme, isDark)}
                        </View>
                    </View>
                    <View style={styles.cardFooter}>
                        <View style={styles.footerInfo}>
                            <View style={styles.infoRow}>
                                <MaterialIcons name="event" size={16} color={theme.colors.secondary} />
                                <Text style={[styles.infoText, { color: theme.colors.subText }]}>{item.scheduledDate ? new Date(item.scheduledDate).toLocaleDateString() : 'Tarih Yok'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <MaterialIcons name="person" size={16} color={theme.colors.secondary} />
                                <Text style={[styles.infoText, { color: theme.colors.subText }]}>
                                    Atanan: {item.assignments?.[0]?.team?.name || item.assignments?.[0]?.worker?.name || item.assignee?.name || 'Atanmamış'}
                                </Text>
                            </View>
                        </View>
                        <View
                            style={[styles.detailsButton, { backgroundColor: theme.colors.primary }]}
                        >
                            <Text style={[styles.detailsButtonText, { color: theme.colors.textInverse }]}>Detaylar</Text>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: { borderRadius: 16, borderWidth: 1, marginBottom: 16, overflow: 'hidden' }, // Removing fixed bg and border
    cardCompleted: { opacity: 0.6 },
    cardContent: { padding: 16 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    cardTitle: { fontSize: 16, fontWeight: '700', flex: 1, marginRight: 8, lineHeight: 22 },
    textStrike: { textDecorationLine: 'line-through' },
    headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    priorityDot: { width: 10, height: 10, borderRadius: 5 },
    badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    badgeText: { fontSize: 11, fontWeight: '600' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
    footerInfo: { gap: 6 },
    infoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    infoText: { fontSize: 13 },
    detailsButton: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, minWidth: 80, alignItems: 'center' },
    detailsButtonText: { fontSize: 13, fontWeight: '600' },
});

export default memo(JobListItem);
