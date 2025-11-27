import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';
import { sendJobNotification } from '@/lib/notification-helper';
import { z } from 'zod';

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
        console.log('Reject Substep Params:', paramsValue);
        const { substepId } = paramsValue;
        console.log('Substep ID:', substepId);
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

        return NextResponse.json(substep);
    } catch (error) {
        console.error('Error rejecting substep:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
