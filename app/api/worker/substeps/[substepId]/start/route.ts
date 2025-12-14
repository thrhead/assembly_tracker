import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';
import { sendAdminNotification } from '@/lib/notification-helper';
import { broadcast } from '@/lib/socket';

export async function POST(request: Request, { params }: { params: Promise<{ substepId: string }> }) {
    try {
        console.log('[DEBUG] POST request received at flattened route');
        const paramsValue = await params;
        const { substepId } = paramsValue;
        console.log('[DEBUG] SubstepId:', substepId);

        const session = await verifyAuth(request);
        if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const substep = await prisma.jobSubStep.findUnique({
            where: { id: substepId },
            include: {
                step: {
                    include: { job: { select: { id: true, title: true } } }
                }
            }
        });
        console.log('[DEBUG] Substep found:', substep ? 'Yes' : 'No');

        if (!substep) {
            return NextResponse.json({ error: 'Substep not found' }, { status: 404 });
        }

        if (substep.startedAt) {
            return NextResponse.json({ error: 'Substep already started' }, { status: 400 });
        }

        console.log('[DEBUG] Attempting to update substep with startedAt...');
        const updatedSubstep = await prisma.jobSubStep.update({
            where: { id: substepId },
            data: {
                startedAt: new Date()
            }
        });
        console.log('[DEBUG] Substep updated successfully');

        // Notify admins when work starts (DB + Push)
        await sendAdminNotification(
            'İşe Başlandı',
            `"${substep.step.job.title}" - "${substep.title}" başlatıldı (${session.user.name || session.user.email})`,
            'INFO',
            `/admin/jobs/${substep.step.job.id}`,
            session.user.id
        );

        // Socket.IO broadcast for real-time web notifications
        broadcast('substep:started', {
            substepId: substepId,
            jobId: substep.step.job.id,
            jobTitle: substep.step.job.title,
            substepTitle: substep.title,
            startedBy: session.user.name || session.user.email
        });

        return NextResponse.json(updatedSubstep);
    } catch (error: any) {
        console.error('Error starting substep:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message || String(error)
        }, { status: 500 });
    }
}
