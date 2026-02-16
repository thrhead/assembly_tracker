import React, { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';
import { MaterialIcons } from '@expo/vector-icons';

const NotificationItem = ({ item, onPress, theme }) => {
    const colors = theme ? theme.colors : COLORS;

    const getIconConfig = (type) => {
        switch (type) {
            case 'SUCCESS':
                return { name: 'check-circle', color: colors.success || '#10B981' };
            case 'ERROR':
                return { name: 'error', color: colors.error || '#EF4444' };
            default:
                return { name: 'info', color: colors.info || '#3B82F6' };
        }
    };

    const iconConfig = getIconConfig(item.type);

    return (
        <TouchableOpacity
            style={[
                styles.card,
                { backgroundColor: colors.surface, shadowColor: colors.shadow },
                !item.isRead && [styles.unreadCard, { borderLeftColor: colors.primary, backgroundColor: colors.primary + '10' }]
            ]}
            onPress={() => onPress(item)}
        >
            <View style={styles.iconContainer}>
                <MaterialIcons name={iconConfig.name} size={28} color={iconConfig.color} />
            </View>
            <View style={styles.content}>
                <Text style={[styles.title, { color: colors.text }]}>{item.title}</Text>
                <Text style={[styles.message, { color: colors.subText }]}>{item.message}</Text>
                <Text style={[styles.date, { color: colors.subText + '80' }]}>
                    {new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadCard: {
        borderLeftWidth: 4,
    },
    iconContainer: {
        marginRight: 12,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
    },
});

export default memo(NotificationItem);
