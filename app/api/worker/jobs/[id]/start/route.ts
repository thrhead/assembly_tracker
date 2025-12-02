import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyAuth } from '@/lib/auth-helper';

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

        if (job.status !== 'PENDING') {
            return NextResponse.json({ error: 'Job already started or completed' }, { status: 400 });
        }

        const updatedJob = await prisma.job.update({
            where: { id },
            data: {
                status: 'IN_PROGRESS',
                startedAt: new Date(),
                updatedAt: new Date()
            }
        });

        return NextResponse.json(updatedJob);
    } catch (error) {
        console.error('Error starting job:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
