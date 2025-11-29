import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import notificationService from '../../services/notification.service';

export default function NotificationsScreen({ navigation }) {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useFocusEffect(
        useCallback(() => {
            loadNotifications();
        }, [])
    );

    const loadNotifications = async () => {
        try {
            const data = await notificationService.getNotifications();
            // Filter to show only unread or all? User said "kaybolsun" after click, 
            // so maybe we should only show unread or active ones. 
            // For now, let's show all but prioritize unread visually, 
            // and remove from list when clicked if that's the desired effect.
            // But if we remove them, the user can't see history.
            // Let's assume "kaybolsun" means remove from the "Unread" state/view.
            // If the list is mixed, we just update the state.
            // However, to strictly follow "kaybolsun" (disappear), I will filter out read ones OR remove from list on click.
            // Let's just set data.
            setNotifications(data);
        } catch (error) {
            console.error('Error loading notifications:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadNotifications();
    };

    const handleNotificationPress = async (notification) => {
        try {
            // 1. Mark as read in backend
            if (!notification.isRead) {
                await notificationService.markAsRead(notification.id);

                // 2. Remove from list (make it "disappear" as requested)
                setNotifications(prev => prev.filter(n => n.id !== notification.id));
            }

            // 3. Navigate if link exists
            if (notification.link) {
                // Parse link to navigate (e.g., /jobs/123)
                const match = /\/jobs\/(\w+)/.exec(notification.link);
                if (match && match[1]) {
                    navigation.navigate('JobDetail', { jobId: match[1] });
                }
            }
        } catch (error) {
            console.error('Error handling notification press:', error);
        }
    };

    const renderNotification = ({ item }) => (
        <TouchableOpacity
            style={[styles.card, !item.isRead && styles.unreadCard]}
            onPress={() => handleNotificationPress(item)}
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

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#16A34A" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={notifications}
                renderItem={renderNotification}
                keyExtractor={item => item.id}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#16A34A']} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyText}>Bildiriminiz yok.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F3F4F6',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
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
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
    },
    emptyText: {
        color: '#6B7280',
        fontSize: 16,
    },
});
