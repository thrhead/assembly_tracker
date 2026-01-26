
import { prisma } from './db';
import crypto from 'crypto';

const RETRY_SCHEDULE = [
    60 * 1000,          // 1 minute
    5 * 60 * 1000,      // 5 minutes
    15 * 60 * 1000,     // 15 minutes
    60 * 60 * 1000,     // 1 hour
    6 * 60 * 60 * 1000, // 6 hours
    24 * 60 * 60 * 1000 // 24 hours
];

/**
 * Queues a webhook for delivery. Creates a log entry and initiates the first attempt.
 */
export async function queueWebhook(webhookId: string, event: string, payload: Record<string, unknown>) {
    const body = JSON.stringify({
        event,
        timestamp: new Date().toISOString(),
        data: payload
    });

    const log = await prisma.webhookLog.create({
        data: {
            webhookId,
            event,
            payload: body,
            status: 'PENDING',
            attemptCount: 0,
        }
    });

    // Initial attempt in background
    deliverWebhook(log.id).catch(err => {
        console.error(`[WebhookDeliverer] Initial delivery background error for log ${log.id}:`, err);
    });
}

/**
 * Performs the actual delivery attempt for a given WebhookLog entry.
 */
export async function deliverWebhook(logId: string) {
    const log = await prisma.webhookLog.findUnique({
        where: { id: logId },
        include: { webhook: true }
    });

    if (!log || !log.webhook || !log.webhook.isActive) return;
    if (log.status === 'SUCCESS') return;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Assembly-Tracker-Event': log.event,
        'X-Assembly-Tracker-Log-Id': log.id
    };

    // HMAC Signature for security
    if (log.webhook.secret) {
        const signature = crypto
            .createHmac('sha256', log.webhook.secret)
            .update(log.payload)
            .digest('hex');
        headers['X-Hub-Signature-256'] = `sha256=${signature}`;
    }

    const startTime = Date.now();
    try {
        const response = await fetch(log.webhook.url, {
            method: 'POST',
            headers,
            body: log.payload,
            signal: AbortSignal.timeout(10000)
        });

        const responseData = await response.text();
        const statusCode = response.status;

        if (response.ok) {
            await prisma.webhookLog.update({
                where: { id: logId },
                data: {
                    status: 'SUCCESS',
                    statusCode,
                    response: responseData,
                    attemptCount: log.attemptCount + 1,
                    updatedAt: new Date()
                }
            });
            console.log(`[WebhookDeliverer] Successfully delivered log ${logId} to ${log.webhook.url}`);
            return;
        }

        // Handle HTTP failure (e.g. 500, 404)
        await handleFailure(logId, log.attemptCount + 1, statusCode, responseData, null);
    } catch (err: unknown) {
        // Handle network/timeout error
        const errorMessage = err instanceof Error ? err.message : String(err);
        await handleFailure(logId, log.attemptCount + 1, 0, null, errorMessage);
    }
}

/**
 * Internal helper to schedule retries or mark as failed.
 */
async function handleFailure(logId: string, nextAttemptCount: number, statusCode: number, response: string | null, error: string | null) {
    const isLastAttempt = nextAttemptCount >= RETRY_SCHEDULE.length;
    const status = isLastAttempt ? 'FAILED' : 'PENDING';

    // Exponential backoff interval
    const delayMs = isLastAttempt ? null : RETRY_SCHEDULE[nextAttemptCount - 1];
    const nextAttemptAt = delayMs ? new Date(Date.now() + delayMs) : null;

    await prisma.webhookLog.update({
        where: { id: logId },
        data: {
            status,
            statusCode,
            response,
            error,
            attemptCount: nextAttemptCount,
            nextAttemptAt,
            updatedAt: new Date()
        }
    });

    console.warn(`[WebhookDeliverer] Delivery failed for log ${logId}. Status: ${status}, Attempts: ${nextAttemptCount}`);

    if (status === 'PENDING' && nextAttemptAt) {
        // For small delays, we can use setTimeout. 
        // For long delays, a separate background worker should pick these up from the database.
        const delay = nextAttemptAt.getTime() - Date.now();
        if (delay < 60 * 60 * 1000) { // Only setTimeout for delays < 1 hour
            setTimeout(() => {
                deliverWebhook(logId).catch(() => { });
            }, delay);
        }
    }
}
