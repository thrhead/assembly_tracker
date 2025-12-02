import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';

export async function POST(request: Request, { params }: { params: Promise<{ id: string; stepId: string }> }) {
    try {
        const session = await verifyAuth(request);
        if (!session || !['WORKER', 'TEAM_LEAD', 'ADMIN', 'MANAGER'].includes(session.user.role)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, stepId } = await params;

        const step = await prisma.jobStep.findUnique({
            where: { id: stepId, jobId: id }
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

        return NextResponse.json(updatedStep);
    } catch (error) {
        console.error('Error starting step:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
