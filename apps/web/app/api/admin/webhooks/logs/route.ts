
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(req: NextRequest) {
    const session = await auth();

    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const webhookId = searchParams.get('webhookId');
    const limit = parseInt(searchParams.get('limit') || '50');

    try {
        const logs = await prisma.webhookLog.findMany({
            where: webhookId ? { webhookId } : {},
            orderBy: { createdAt: 'desc' },
            take: limit,
            include: {
                webhook: {
                    select: {
                        url: true,
                        event: true
                    }
                }
            }
        });

        return NextResponse.json(logs);
    } catch (error) {
        console.error('[WebhooksLogsAPI] Error fetching logs:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    // Manual retry endpoint
    const session = await auth();

    if (!session || !['ADMIN', 'MANAGER'].includes(session.user.role)) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { logId } = await req.json();
        if (!logId) return NextResponse.json({ error: 'Log ID required' }, { status: 400 });

        // Directly calling deliverer would be best here if exported
        // For now, we can trigger a retry via the database if we had a worker, 
        // but we'll import the deliverer function directly.
        const { deliverWebhook } = await import('@/lib/webhook-deliverer');

        // We don't await this to keep the response fast
        deliverWebhook(logId).catch(err => console.error(`Manual retry failed for ${logId}`, err));

        return NextResponse.json({ success: true, message: 'Retry initiated' });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
