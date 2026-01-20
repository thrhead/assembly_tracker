import { prisma } from "@/lib/db";

export async function getCalendarEvents({ start, end }: { start: Date, end: Date }) {
    const jobs = await prisma.job.findMany({
        where: {
            OR: [
                {
                    scheduledDate: {
                        gte: start,
                        lte: end
                    }
                },
                // Include jobs that span across the range or end within it
                // Simplified for now based on typical calendar usage
            ]
        },
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
