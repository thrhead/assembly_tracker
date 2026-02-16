
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { deliverWebhook } from '@/lib/webhook-deliverer';

// Vercel Cron Secret check (Optional but recommended)
function verifyCron(req: Request) {
    const authHeader = req.headers.get('authorization');
    return authHeader === `Bearer ${process.env.CRON_SECRET}`;
}

export async function GET(req: Request) {
    // Basic verification - for Vercel Cron, ensure CRON_SECRET matches
    // if (process.env.CRON_SECRET && !verifyCron(req)) {
    //     return new NextResponse('Unauthorized', { status: 401 });
    // }

    try {
        const pendingWebhooks = await prisma.webhookLog.findMany({
            where: {
                status: 'PENDING',
                nextAttemptAt: {
                    lte: new Date(),
                },
            },
            take: 50, // Process in batches
        });

        console.log(`[Cron] Found ${pendingWebhooks.length} pending webhooks to retry.`);

        const results = await Promise.allSettled(
            pendingWebhooks.map((log) => deliverWebhook(log.id))
        );

        const successCount = results.filter((r) => r.status === 'fulfilled').length;
        const failCount = results.filter((r) => r.status === 'rejected').length;

        return NextResponse.json({
            processed: pendingWebhooks.length,
            success: successCount,
            failures: failCount,
        });
    } catch (error: any) {
        console.error('[Cron] Webhook retry failed:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
