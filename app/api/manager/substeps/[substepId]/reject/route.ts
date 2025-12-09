import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';
import { sendJobNotification } from '@/lib/notification-helper';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const rejectSchema = z.object({
    reason: z.string().min(1, "Red sebebi gereklidir"),
});

export async function POST(request: Request, { params }: { params: Promise<{ substepId: string }> }) {
    try {
        const session = await verifyAuth(request);

        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const paramsValue = await params;
        const { substepId } = paramsValue;
        const body = await request.json();
        const { reason } = rejectSchema.parse(body);

        const substep = await prisma.jobSubStep.update({
            where: { id: substepId },
            data: {
                approvalStatus: 'REJECTED',
                rejectionReason: reason,
                isCompleted: false, // Reset completion status on rejection
                completedAt: null,
            },
            include: {
                step: {
                    include: {
                        job: true
                    }
                }
            }
        });

        await sendJobNotification(
            substep.step.jobId,
            'Alt Görev Reddedildi',
            `"${substep.step.job.title}" işindeki "${substep.title}" alt görevi reddedildi. Sebep: ${reason}`,
            'ERROR',
            `/jobs/${substep.step.jobId}`
        );

        logger.info(`Substep rejected by manager: ${substepId}, Reason: ${reason}`);

        return NextResponse.json(substep);
    } catch (error) {
        logger.error(`Error rejecting substep: ${error instanceof Error ? error.message : String(error)}`);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
