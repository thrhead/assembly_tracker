import { triggerWebhook } from './webhook-service'
import { prisma } from './db'
import { generateJobPDF } from './pdf-generator'
import { saveReportToStorage } from './reports-storage'

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

        // Automated Report Generation for Completed Jobs
        if (event === 'job.completed' && payload?.id) {
            try {
                const job = await prisma.job.findUnique({
                    where: { id: payload.id },
                    include: {
                        customer: { include: { user: true } },
                        steps: { orderBy: { order: 'asc' } },
                        costs: true,
                        assignments: { include: { team: true } }
                    }
                });

                if (job) {
                    const mappedJob = {
                        ...job,
                        team: job.assignments[0]?.team
                    };
                    const doc = generateJobPDF(mappedJob as any);
                    const buffer = doc.output('arraybuffer');
                    await saveReportToStorage(job.id, buffer);
                    console.log(`[EventBus] Automated report generated for Job: ${job.id}`);
                }
            } catch (err) {
                console.error(`[EventBus] Automated report generation failed:`, err);
            }
        }
    }
}
