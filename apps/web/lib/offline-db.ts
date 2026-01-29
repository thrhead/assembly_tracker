import Dexie, { Table } from 'dexie'

export interface LocalMessage {
    id: string
    content: string
    senderId: string
    receiverId: string | null
    jobId: string | null
    conversationId: string
    isEncrypted: boolean
    sentAt: string
    status: 'queued' | 'sent' | 'delivered' | 'read'
    tempId?: string
}

export interface SyncQueueItem {
    id?: number
    type: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
    url: string
    payload: any
    createdAt: number
    retryCount?: number
}

export interface LocalLog {
    id?: number
    level: string
    message: string
    context?: any
    stack?: string
    platform: 'web' | 'mobile' | 'server'
    createdAt: string
}

class OfflineDatabase extends Dexie {
    messages!: Table<LocalMessage>
    syncQueue!: Table<SyncQueueItem>
    systemLogs!: Table<LocalLog>

    constructor() {
        super('AssemblyTrackerOfflineDB')

        this.version(2).stores({
            messages: 'id, jobId, conversationId, sentAt, status', // Indexes
            syncQueue: '++id, createdAt',
            systemLogs: '++id, level, createdAt'
        })
    }
}

export const offlineDB = new OfflineDatabase()
