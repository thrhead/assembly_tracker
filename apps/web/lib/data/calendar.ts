import { prisma } from "@/lib/db";

interface GetCalendarEventsParams {
    start: Date;
    end: Date;
    userId?: string;
    role?: string;
}

export async function getCalendarEvents({ start, end, userId, role }: GetCalendarEventsParams) {
    const where: any = {
        OR: [
            { scheduledDate: { gte: start, lte: end } },
            { scheduledEndDate: { gte: start, lte: end } },
            { 
                AND: [
                    { scheduledDate: { lte: start } },
                    { scheduledEndDate: { gte: end } }
                ]
            }
        ]
    };

    if (role === 'CUSTOMER' && userId) {
        const customer = await prisma.customer.findUnique({ where: { userId } });
        if (customer) {
            where.customerId = customer.id;
        } else {
            return [];
        }
    } else if (role === 'WORKER' || role === 'TEAM_LEAD') {
        if (userId) {
            where.assignments = {
                some: {
                    OR: [
                        { workerId: userId },
                        {
                            team: {
                                OR: [
                                    { members: { some: { userId } } },
                                    { leadId: userId }
                                ]
                            }
                        }
                    ]
                }
            };
        }
    }
    // For ADMIN and MANAGER, we don't add assignment filters, so they see all jobs.

    const jobs = await prisma.job.findMany({
        where,
        include: {
            customer: {
                select: { company: true }
            },
            assignments: {
                include: {
                    team: true,
                    worker: true
                }
            }
        }
    });

    const statusColors: Record<string, string> = {
        PENDING: '#fbbf24', // yellow-400
        IN_PROGRESS: '#60a5fa', // blue-400
        COMPLETED: '#34d399', // green-400
        CANCELLED: '#f87171', // red-400
        ON_HOLD: '#fb923c' // orange-400
    };

    return jobs.map(job => {
        let title = job.title;
        if (job.assignments.length > 0) {
            const assignment = job.assignments[0];
            if (assignment.team) {
                title += ` (${assignment.team.name})`;
            } else if (assignment.worker) {
                title += ` (${assignment.worker.name})`;
            }
        }

        return {
            id: job.id,
            title,
            start: job.scheduledDate,
            end: job.scheduledEndDate || job.scheduledDate, // Use start if no end date
            backgroundColor: statusColors[job.status] || '#94a3b8',
            borderColor: statusColors[job.status] || '#94a3b8',
            extendedProps: {
                customer: job.customer.company,
                status: job.status
            }
        };
    });
}
