import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';
import { sendJobNotification } from '@/lib/notification-helper';
import { logger } from '@/lib/logger';

export async function POST(request: Request, { params }: { params: Promise<{ jobId: string }> }) {
    try {
        const session = await verifyAuth(request);

        if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { jobId } = await params;

        // Verify all steps are completed/approved before accepting
        const job = await prisma.job.findUnique({
            where: { id: jobId },
            include: {
                steps: {
                    include: {
                        subSteps: true
                    }
                }
            }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        // Check if all steps are completed
        const allStepsCompleted = job.steps.every(step => step.isCompleted);
        if (!allStepsCompleted) {
            return NextResponse.json({ error: 'All steps must be completed before acceptance' }, { status: 400 });
        }

        const updatedJob = await prisma.job.update({
            where: { id: jobId },
            data: {
                acceptanceStatus: 'ACCEPTED',
                acceptedById: session.user.id,
                acceptedAt: new Date(),
                rejectionReason: null,
                status: 'COMPLETED' // Ensure status is COMPLETED
            },
        });

        await sendJobNotification(
            updatedJob.id,
            'Montaj Kabul Edildi',
            `"${updatedJob.title}" montajı başarıyla kabul edildi.`,
            'SUCCESS',
            `/jobs/${updatedJob.id}`
        );

        logger.info(`Job accepted by manager: ${jobId}`);

        return NextResponse.json(updatedJob);
    } catch (error) {
        logger.error(`Error accepting job: ${error instanceof Error ? error.message : String(error)}`);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
    }
}
