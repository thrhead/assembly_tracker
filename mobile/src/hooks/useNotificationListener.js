import { useEffect } from 'react';
import * as Notifications from 'expo-notifications';
import notificationService from '../services/notification.service';

export function useNotificationListener(user) {
    // Register for push notifications when user is available
    useEffect(() => {
        if (user?.id) {
            notificationService.registerForPushNotificationsAsync().then(token => {
                if (token) {
                    notificationService.sendPushTokenToBackend(token, user.id);
                }
            });
        }
    }, [user]);

    // Handle incoming notifications
    useEffect(() => {
        const subscription = Notifications.addNotificationReceivedListener(notification => {
            console.log("Notification received:", notification);
        });

        const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
            console.log("Notification response received:", response);
        });

        return () => {
            subscription.remove();
            responseSubscription.remove();
        };
    }, []);
}
