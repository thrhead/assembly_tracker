import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';
import { sendAdminNotification } from '@/lib/notification-helper';
import { triggerWebhook } from '@/lib/webhook-service';
import { checkConflict } from '@/lib/conflict-check';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await verifyAuth(request);
        if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        const job = await prisma.job.findUnique({
            where: { id }
        });

        if (!job) {
            return NextResponse.json({ error: 'Job not found' }, { status: 404 });
        }

        const conflict = await checkConflict(request, job.updatedAt);
        if (conflict) {
            const clientVersion = request.headers.get('X-Client-Version');
            console.warn(`[JOB START] Conflict detected for job ${id}. Server: ${job.updatedAt}, Client: ${clientVersion}`);
            return conflict;
        }

        if (job.status !== 'PENDING') {
            if (job.status === 'IN_PROGRESS') {
                console.log(`[JOB START] Job ${id} is already IN_PROGRESS, returning success.`);
                return NextResponse.json(job);
            }
            return NextResponse.json({ error: 'Job already started or completed' }, { status: 400 });
        }

        // Check Access: Ensure the user is assigned to this job or is an admin/manager
        if (!['ADMIN', 'MANAGER'].includes(session.user.role)) {
            const hasAccess = await prisma.jobAssignment.findFirst({
                where: {
                    jobId: id,
                    OR: [
                        { workerId: session.user.id },
                        { team: { members: { some: { userId: session.user.id } } } }
                    ]
                }
            });

            if (!hasAccess) {
                console.warn(`[JOB START] Unauthorized access attempt by ${session.user.email} for job ${id}`);
                return NextResponse.json({ error: 'Forbidden: You are not assigned to this job' }, { status: 403 });
            }
        }

        const updatedJob = await prisma.job.update({
            where: { id },
            data: {
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                updatedAt: new Date()
            }
        });

        // Notify admins
        console.log('[JOB START] About to send admin notification for job:', job.id, job.title);
        await sendAdminNotification(
            'İş Başladı',
            `"${job.title}" işi ${session.user.name || session.user.email} tarafından başlatıldı.`,
            'INFO',
            `/admin/jobs/${id}`,
            session.user.id
        );
        console.log('[JOB START] Admin notification sent successfully');

        // Trigger webhook
        await triggerWebhook('job.started', {
            jobId: id,
            worker: {
                id: session.user.id,
                name: session.user.name,
                email: session.user.email
            },
            timestamp: updatedJob.startedAt
        });

        return NextResponse.json(updatedJob);
    } catch (error) {
        console.error('Error starting job:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
