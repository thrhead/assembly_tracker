
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

const expo = new Expo();

export async function sendPushNotification(pushToken: string, title: string, body: string, data?: Record<string, unknown>) {
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return;
    }

    const messages: ExpoPushMessage[] = [];
    messages.push({
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
        priority: 'high',
        channelId: 'default',
    });

    try {
        const chunks = expo.chunkPushNotifications(messages);
        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                console.log('Push notification sent:', ticketChunk);
            } catch (error) {
                console.error('Error sending push notification chunk:', error);
            }
        }
    } catch (error) {
        console.error('Error sending push notification:', error);
    }
}
