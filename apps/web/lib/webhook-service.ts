
import { prisma } from './db'
import { queueWebhook } from './webhook-deliverer'

/**
 * Triggers all active webhooks for a specific event.
 * Delivery is offloaded to the resilient WebhookDeliverer.
 */
export async function triggerWebhook(event: string, payload: Record<string, unknown>) {
    try {
        const webhooks = await prisma.webhook.findMany({
            where: { event, isActive: true }
        })

        if (webhooks.length === 0) {
            console.log(`[WebhookService] No active webhooks found for event: ${event}`);
            return [];
        }

        console.log(`[WebhookService] Queuing ${webhooks.length} webhooks for event: ${event}`);

        // We return the queueing promises. The actual delivery happens in the background.
        const results = await Promise.all(webhooks.map(async (webhook) => {
            return queueWebhook(webhook.id, event, payload);
        }));

        return results;
    } catch (error) {
        console.error('[WebhookService] Trigger error:', error)
        throw error;
    }
}
