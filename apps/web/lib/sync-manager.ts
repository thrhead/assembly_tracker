import { offlineDB, SyncQueueItem } from './offline-db'
import { toast } from 'sonner'

const MAX_RETRIES = 3

export class SyncManager {
    private isSyncing = false

    constructor() {
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                console.log('🌐 Online detected. Starting sync...')
                this.processQueue()
            })
        }
    }

    /**
     * Add request to offline queue
     */
    async addToQueue(item: Omit<SyncQueueItem, 'id' | 'createdAt' | 'retryCount'>) {
        await offlineDB.syncQueue.add({
            ...item,
            createdAt: Date.now(),
            retryCount: 0
        })
        console.log('📥 Request queued:', item.url)
        
        if (navigator.onLine) {
            this.processQueue()
        }
    }

    /**
     * Process all queued items
     */
    async processQueue() {
        if (this.isSyncing || !navigator.onLine) return

        try {
            this.isSyncing = true
            const queueItems = await offlineDB.syncQueue.toArray()

            if (queueItems.length === 0) {
                this.isSyncing = false
                return
            }

            console.log(`🔄 Syncing ${queueItems.length} items...`)
            let successCount = 0

            for (const item of queueItems) {
                // Skip if reached max retries
                if ((item.retryCount || 0) >= MAX_RETRIES) {
                    console.warn(`⚠️ Skipping item ${item.id} after ${MAX_RETRIES} failed attempts.`)
                    continue
                }

                try {
                    const response = await fetch(item.url, {
                        method: item.type,
                        headers: {
                            'Content-Type': 'application/json',
                            ...item.payload?.headers 
                        },
                        body: JSON.stringify(item.payload)
                    })

                    if (!response.ok) {
                        // Server error (5xx)
                        if (response.status >= 500) {
                            throw new Error(`Server error: ${response.status}`)
                        } 
                        // Client error (4xx) - usually drop because repeating won't fix it
                        else if (response.status >= 400) {
                             console.warn(`❌ Client error (${response.status}) for ${item.url}. Dropping.`)
                             await offlineDB.syncQueue.delete(item.id!)
                             continue
                        }
                    }

                    // Success
                    console.log(`✅ Synced: ${item.url}`)
                    await offlineDB.syncQueue.delete(item.id!)
                    successCount++

                } catch (error) {
                    console.error(`❌ Sync failed for ${item.url}:`, error)
                    
                    // Increment retry count
                    const currentRetries = (item.retryCount || 0) + 1
                    await offlineDB.syncQueue.update(item.id!, { retryCount: currentRetries })

                    if (currentRetries >= MAX_RETRIES) {
                        toast.error('Senkronizasyon hatası: Bazı işlemler sunucuya iletilemedi.')
                    }
                    
                    // Break the loop to maintain order
                    break 
                }
            }

            if (successCount > 0) {
                toast.success(`Çevrimdışı yapılan ${successCount} işlem senkronize edildi.`)
            }

        } catch (error) {
            console.error('Sync process error:', error)
        } finally {
            this.isSyncing = false
            
            // Re-check queue
            const remaining = await offlineDB.syncQueue.where('retryCount').below(MAX_RETRIES).count()
            if (remaining > 0 && navigator.onLine) {
                setTimeout(() => this.processQueue(), 10000)
            }
        }
    }
}

export const syncManager = new SyncManager()