import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const NotificationItem = ({ item, onPress }) => {
    return (
        <TouchableOpacity
            style={[styles.card, !item.isRead && styles.unreadCard]}
            onPress={() => onPress(item)}
        >
            <View style={styles.iconContainer}>
                <Text style={styles.icon}>
                    {item.type === 'SUCCESS' ? '✅' : item.type === 'ERROR' ? '❌' : 'ℹ️'}
                </Text>
            </View>
            <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.message}>{item.message}</Text>
                <Text style={styles.date}>{new Date(item.createdAt).toLocaleDateString()} {new Date(item.createdAt).toLocaleTimeString()}</Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    unreadCard: {
        borderLeftWidth: 4,
        borderLeftColor: '#16A34A',
        backgroundColor: '#F0FDF4',
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
        color: '#111827',
        marginBottom: 4,
    },
    message: {
        fontSize: 14,
        color: '#4B5563',
        marginBottom: 8,
    },
    date: {
        fontSize: 12,
        color: '#9CA3AF',
    },
});

export default NotificationItem;
