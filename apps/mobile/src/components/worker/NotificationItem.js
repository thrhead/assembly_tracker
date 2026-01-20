import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/theme';

const NotificationItem = ({ item, onPress, theme }) => {
    const colors = theme ? theme.colors : COLORS;

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
                <Text style={styles.icon}>
                    {item.type === 'SUCCESS' ? '✅' : item.type === 'ERROR' ? '❌' : 'ℹ️'}
                </Text>
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
    icon: {
        fontSize: 24,
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

export default NotificationItem;
