import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';
import { sendAdminNotification } from '@/lib/notification-helper';
import { broadcast } from '@/lib/socket';

export async function POST(request: Request, { params }: { params: Promise<{ id: string; stepId: string }> }) {
    try {
        const session = await verifyAuth(request);
        if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, stepId } = await params;

        const step = await prisma.jobStep.findUnique({
            where: { id: stepId, jobId: id },
            include: { job: { select: { id: true, title: true } } }
        });

        if (!step) {
            return NextResponse.json({ error: 'Step not found' }, { status: 404 });
        }

        if (step.startedAt) {
            return NextResponse.json({ error: 'Step already started' }, { status: 400 });
        }

        const updatedStep = await prisma.jobStep.update({
            where: { id: stepId },
            data: {
                startedAt: new Date()
            }
        });

        // Socket.IO broadcast for real-time web notifications
        broadcast('step:started', {
            stepId: stepId,
            jobId: step.job.id,
            jobTitle: step.job.title,
            stepTitle: step.title,
            startedBy: session.user.name || session.user.email
        });

        // Send push notification to admins (DB + Push)
        await sendAdminNotification(
            'Ana Görev Başladı',
            `"${step.job.title}" - "${step.title}" başlatıldı (${session.user.name || session.user.email})`,
            'INFO',
            `/admin/jobs/${step.job.id}`,
            session.user.id
        );

        return NextResponse.json(updatedStep);
    } catch (error) {
        console.error('Error starting step:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
