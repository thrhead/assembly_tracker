
import { triggerWebhook } from './webhook-service'

type EventType = 'job.created' | 'job.updated' | 'job.completed' | 'job.deleted' | 'cost.created'

/**
 * Central event bus for the application to trigger side effects like Webhooks.
 */
export const EventBus = {
    /**
     * Emits an event and triggers associated webhooks
     */
    emit: async (event: EventType, payload: any) => {
        console.log(`[EventBus] Emitting event: ${event}`)
        
        // Trigger webhooks in the background
        triggerWebhook(event, payload).catch(err => {
            console.error(`[EventBus] Webhook trigger failed for ${event}:`, err)
        })

        // Potential for more listeners here (e.g. Analytics, Audit Logs)
    }
}
