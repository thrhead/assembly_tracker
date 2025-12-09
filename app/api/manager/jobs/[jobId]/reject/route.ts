import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';
import { sendJobNotification } from '@/lib/notification-helper';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const rejectSchema = z.object({
    reason: z.string().min(1, "Red sebebi gereklidir"),
});

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
    try {
        const session = await verifyAuth(request);

        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const paramsValue = await params;
        const { jobId } = paramsValue;
        const body = await request.json();
        const { reason } = rejectSchema.parse(body);

        const job = await prisma.job.update({
            where: { id: jobId },
            data: {
                acceptanceStatus: 'REJECTED',
                rejectionReason: reason,
                // We keep the main status as COMPLETED or move back to IN_PROGRESS?
                // If rejected, the worker needs to fix it. So IN_PROGRESS makes sense.
                status: 'IN_PROGRESS',
                completedDate: null, // Reset completion
            },
            include: {
                assignments: {
                    include: {
                        worker: true
                    }
                }
            }
        });

        // Notify all assigned workers
        await sendJobNotification(
            job.id,
            'İş Reddedildi ❌',
            `"${job.title}" işi reddedildi. Sebep: ${reason}`,
            'ERROR',
            `/jobs/${job.id}`
        );

        logger.info(`Job rejected by manager: ${jobId}, Reason: ${reason}`);

        return NextResponse.json(job);
    } catch (error) {
        logger.error(`Error rejecting job: ${error instanceof Error ? error.message : String(error)}`);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
