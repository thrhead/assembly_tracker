import { prisma } from '@/lib/db';

export type NotificationType = 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';

export async function sendJobNotification(
    jobId: string,
    title: string,
    message: string,
    type: NotificationType,
    link?: string
) {
    try {
        // 1. Get all assignments for the job
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

        // 3. Create notifications
        if (recipientIds.size > 0) {
            await prisma.notification.createMany({
                data: Array.from(recipientIds).map(userId => ({
                    userId,
                    title,
                    message,
                    type,
                    link,
                    isRead: false,
                }))
            });
            console.log(`Notification sent to ${recipientIds.size} users for job ${jobId}`);
        }
    } catch (error) {
        console.error('Error sending job notification:', error);
        // Don't throw, just log. Notification failure shouldn't fail the main action.
    }
}
