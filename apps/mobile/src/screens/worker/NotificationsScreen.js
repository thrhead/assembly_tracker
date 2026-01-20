import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationItem from '../../components/worker/NotificationItem';

export default function NotificationsScreen({ navigation }) {
    const { theme, isDark } = useTheme();
    const { notifications, loading, refreshing, onRefresh, markAsRead } = useNotifications();

    const handleNotificationPress = React.useCallback(async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification.id);
        }

        if (notification.link) {
            const match = /\/jobs\/(\w+)/.exec(notification.link);
            if (match && match[1]) {
                navigation.navigate('JobDetail', { jobId: match[1] });
            }
        }
    }, [markAsRead, navigation]);

    const renderItem = React.useCallback(({ item }) => (
        <NotificationItem
            item={item}
            onPress={handleNotificationPress}
            theme={theme}
        />
    ), [handleNotificationPress, theme]);

    if (loading) {
        return (
            <View style={[styles.centerContainer, { backgroundColor: theme.colors.background }]}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
            <FlatList
                style={{ flex: 1 }}
                data={notifications}
                renderItem={renderItem}
                keyExtractor={item => item.id}
                contentContainerStyle={[styles.list, { flexGrow: 1 }]}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.primary} />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="notifications-none" size={64} color={theme.colors.subText} />
                        <Text style={[styles.emptyText, { color: theme.colors.subText }]}>Bildiriminiz yok.</Text>
                    </View>
                }
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={Platform.OS === 'android'}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    list: {
        padding: 16,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        marginTop: 100,
    },
    emptyText: {
        fontSize: 16,
        marginTop: 16,
    },
});
