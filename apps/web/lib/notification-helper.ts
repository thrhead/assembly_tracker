import { prisma } from '@/lib/db';
import { Expo, ExpoPushMessage } from 'expo-server-sdk';

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

const expo = new Expo();

export async function sendJobNotification(
    jobId: string,
    title: string,
    message: string,
    type: NotificationType,
    link?: string
) {
    try {
        // 1. Get all assignments for the job to find recipients
        const assignments = await prisma.jobAssignment.findMany({
            where: { jobId },
            include: {
                team: {
                    include: {
                        members: true
                    }
                }
            }
        });

        // 2. Collect all user IDs
        const recipientIds = new Set<string>();

        for (const assignment of assignments) {
            if (assignment.workerId) {
                recipientIds.add(assignment.workerId);
            }
            if (assignment.teamId && assignment.team) {
                for (const member of assignment.team.members) {
                    recipientIds.add(member.userId);
                }
            }
        }

        if (recipientIds.size === 0) return;

        const recipientIdArray = Array.from(recipientIds);

        // 3. Create notifications in DB
        await prisma.notification.createMany({
            data: recipientIdArray.map(userId => ({
                userId,
                title,
                message,
                type,
                link,
                isRead: false,
            }))
        });
        console.log(`DB Notification created for ${recipientIds.size} users for job ${jobId}`);

        // 4. Send Push Notifications
        // Fetch users with their push tokens (legacy and new)
        const users = await prisma.user.findMany({
            where: {
                id: { in: recipientIdArray }
            },
            include: {
                pushTokens: true
            }
        });

        const messages: ExpoPushMessage[] = [];
        for (const user of users) {
            // Collect tokens from both legacy field and new relation
            const tokens = new Set<string>();
            
            if (user.pushToken) tokens.add(user.pushToken);
            user.pushTokens.forEach(pt => tokens.add(pt.token));

            for (const token of tokens) {
                if (Expo.isExpoPushToken(token)) {
                    messages.push({
                        to: token,
                        sound: 'default',
                        title: title,
                        body: message,
                        data: { jobId, link },
                        priority: 'high',
                        channelId: 'default',
                    });
                }
            }
        }

        if (messages.length > 0) {
            const chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log('Push notification tickets:', ticketChunk);
                } catch (error) {
                    console.error('Error sending push notification chunk:', error);
                }
            }
        }

    } catch (error) {
        console.error('Error sending job notification:', error);
    }
}

/**
 * Send notification to all ADMIN users
 */
export async function sendAdminNotification(
    title: string,
    message: string,
    type: NotificationType,
    link?: string,
    excludeUserId?: string
) {
    try {
        // 1. Find all admin users
        const admins = await prisma.user.findMany({
            where: {
                role: 'ADMIN',
                isActive: true,
                ...(excludeUserId ? { id: { not: excludeUserId } } : {})
            },
            include: {
                pushTokens: true
            }
        });

        if (admins.length === 0) return;

        const adminIds = admins.map(a => a.id);

        // 2. Create notifications in DB
        await prisma.notification.createMany({
            data: adminIds.map(userId => ({
                userId,
                title,
                message,
                type,
                link,
                isRead: false,
            }))
        });
        console.log(`Admin notification created for ${admins.length} admins`);

        // 3. Send Push Notifications
        const messages: ExpoPushMessage[] = [];
        
        for (const admin of admins) {
            const tokens = new Set<string>();
            if (admin.pushToken) tokens.add(admin.pushToken);
            admin.pushTokens.forEach(pt => tokens.add(pt.token));

            for (const token of tokens) {
                if (Expo.isExpoPushToken(token)) {
                    messages.push({
                        to: token,
                        sound: 'default',
                        title: title,
                        body: message,
                        data: { link },
                        priority: 'high',
                        channelId: 'default',
                    });
                }
            }
        }

        if (messages.length > 0) {
            const chunks = expo.chunkPushNotifications(messages);
            for (const chunk of chunks) {
                try {
                    const tickets = await expo.sendPushNotificationsAsync(chunk);
                    console.log('Admin push notification tickets:', tickets);
                } catch (error) {
                    console.error('Error sending admin push notification:', error);
                }
            }
        }

        } catch (error) {

            console.error('Error sending admin notification:', error);

        }

    }

    

    /**

     * Send notification to a specific user

     */

    export async function sendUserNotification(

        userId: string,

        title: string,

        message: string,

        type: NotificationType,

        link?: string

    ) {

        try {

            // 1. Get user and push tokens

            const user = await prisma.user.findUnique({

                where: { id: userId },

                include: { pushTokens: true }

            });

    

            if (!user) return;

    

            // 2. Create notification in DB

            await prisma.notification.create({

                data: {

                    userId,

                    title,

                    message,

                    type,

                    link,

                    isRead: false,

                }

            });

            console.log(`Notification created for user ${userId}`);

    

            // 3. Send Push Notifications

            const messages: ExpoPushMessage[] = [];

            const tokens = new Set<string>();

            

            if (user.pushToken) tokens.add(user.pushToken);

            user.pushTokens.forEach(pt => tokens.add(pt.token));

    

            for (const token of tokens) {

                if (Expo.isExpoPushToken(token)) {

                    messages.push({

                        to: token,

                        sound: 'default',

                        title: title,

                        body: message,

                        data: { link },

                        priority: 'high',

                        channelId: 'default',

                    });

                }

            }

    

            if (messages.length > 0) {

                const chunks = expo.chunkPushNotifications(messages);

                for (const chunk of chunks) {

                    try {

                        await expo.sendPushNotificationsAsync(chunk);

                    } catch (error) {

                        console.error('Error sending push notification chunk:', error);

                    }

                }

            }

        } catch (error) {

            console.error('Error sending user notification:', error);

        }

    }

    