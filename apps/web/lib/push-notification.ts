import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk'

let expo = new Expo()

export interface PushNotificationPayload {
    to: string
    title: string
    body: string
    data?: Record<string, any>
    sound?: 'default' | null
}

/**
 * Sends a single push notification
 */
export async function sendPushNotification(payload: PushNotificationPayload): Promise<ExpoPushTicket[]> {
    if (!Expo.isExpoPushToken(payload.to)) {
        throw new Error(`Invalid Expo Push Token: ${payload.to}`)
    }

    const messages: ExpoPushMessage[] = [{
        to: payload.to,
        sound: payload.sound || 'default',
        title: payload.title,
        body: payload.body,
        data: payload.data,
    }]

    const chunks = expo.chunkPushNotifications(messages)
    const tickets: ExpoPushTicket[] = []

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
            tickets.push(...ticketChunk)
        } catch (error) {
            console.error('Error sending push notification chunk:', error)
            throw error
        }
    }

    return tickets
}

/**
 * Sends multiple push notifications in chunks
 */
export async function sendMultiplePushNotifications(messages: PushNotificationPayload[]): Promise<ExpoPushTicket[][]> {
    const expoMessages: ExpoPushMessage[] = messages.filter(msg => Expo.isExpoPushToken(msg.to)).map(msg => ({
        to: msg.to,
        sound: msg.sound || 'default',
        title: msg.title,
        body: msg.body,
        data: msg.data,
    }))

    const chunks = expo.chunkPushNotifications(expoMessages)
    const results: ExpoPushTicket[][] = []

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk)
            results.push(ticketChunk)
        } catch (error) {
            console.error('Error sending push notification chunk:', error)
            // Continue with other chunks even if one fails
        }
    }

    return results
}
