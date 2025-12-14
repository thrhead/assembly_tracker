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
        // Fetch users to get their push tokens
        const users = await prisma.user.findMany({
            where: {
                id: { in: recipientIdArray },
                pushToken: { not: null }
            },
            select: { pushToken: true }
        });

        const messages: ExpoPushMessage[] = [];
        for (const user of users) {
            if (user.pushToken && Expo.isExpoPushToken(user.pushToken)) {
                messages.push({
                    to: user.pushToken,
                    sound: 'default',
                    title: title,
                    body: message,
                    data: { jobId, link },
                });
            }
        }

        if (messages.length > 0) {
            const chunks = expo.chunkPushNotifications(messages);
            const tickets = [];
            for (const chunk of chunks) {
                try {
                    const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                    console.log('Push notification tickets:', ticketChunk);
                    tickets.push(...ticketChunk);
                } catch (error) {
                    console.error('Error sending push notification chunk:', error);
                }
            }
        }

    } catch (error) {
        console.error('Error sending job notification:', error);
        // Don't throw, just log. Notification failure shouldn't fail the main action.
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
    excludeUserId?: string // Exclude the user who triggered the action
) {
    try {
        // 1. Find all admin users
        const admins = await prisma.user.findMany({
            where: {
                role: 'ADMIN',
                isActive: true,
                ...(excludeUserId ? { id: { not: excludeUserId } } : {})
            },
            select: { id: true, pushToken: true }
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
        console.log(`[ADMIN PUSH] Checking ${admins.length} admins for push tokens...`);
        for (const admin of admins) {
            console.log(`[ADMIN PUSH] Admin ${admin.id}: pushToken = ${admin.pushToken ? 'EXISTS' : 'NULL'}`);
            if (admin.pushToken && Expo.isExpoPushToken(admin.pushToken)) {
                messages.push({
                    to: admin.pushToken,
                    sound: 'default',
                    title: title,
                    body: message,
                    data: { link },
                });
            }
        }

        console.log(`[ADMIN PUSH] ${messages.length} push messages to send`);
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
        } else {
            console.log('[ADMIN PUSH] No push tokens found for admins - skipping push notifications');
        }

    } catch (error) {
        console.error('Error sending admin notification:', error);
    }
}
