import { offlineDB, LocalLog } from './offline-db'

export const LogLevel = {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
    AUDIT: 'AUDIT',
}

const BATCH_SIZE = 30
const SYNC_INTERVAL = 60000 // 1 minute

class Logger {
    private isSyncing = false

    constructor() {
        if (typeof window !== 'undefined') {
            // Periodic sync
            setInterval(() => this.sync(), SYNC_INTERVAL)

            // Sync on online event
            window.addEventListener('online', () => this.sync())

            // Catch unhandled errors
            window.addEventListener('error', (event) => {
                this.error('Unhandled UI Error', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno,
                    colno: event.colno
                }, event.error?.stack)
            })

            window.addEventListener('unhandledrejection', (event) => {
                this.error('Unhandled Promise Rejection', {
                    reason: String(event.reason)
                }, event.reason?.stack)
            })
        }
    }

    async log(level: string, message: string, context?: any, stack?: string) {
        try {
            const newLog: LocalLog = {
                level,
                message,
                context,
                stack,
                platform: typeof window !== 'undefined' ? 'web' : 'server',
                createdAt: new Date().toISOString()
            }

            if (typeof window !== 'undefined') {
                await offlineDB.systemLogs.add(newLog)

                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Logger] [${level}] ${message}`, context || '')
                }

                const count = await offlineDB.systemLogs.count()
                if (count >= BATCH_SIZE) {
                    this.sync()
                }
            } else {
                // Server-side logging
                console.log(`[Server Logger] [${level}] ${message}`)
                // We could also call the internal Batch sync logic here if needed
                // But usually server logs go to stdout/Vercel logs
            }
        } catch (error) {
            console.error('Error adding log to repository:', error)
        }
    }

    debug(msg: string, ctx?: any) { this.log(LogLevel.DEBUG, msg, ctx) }
    info(msg: string, ctx?: any) { this.log(LogLevel.INFO, msg, ctx) }
    warn(msg: string, ctx?: any) { this.log(LogLevel.WARN, msg, ctx) }
    error(msg: string, ctx?: any, stack?: string) { this.log(LogLevel.ERROR, msg, ctx, stack) }
    audit(msg: string, ctx?: any) { this.log(LogLevel.AUDIT, msg, ctx) }

    async sync() {
        if (this.isSyncing || typeof window === 'undefined') return
        if (!navigator.onLine) return

        this.isSyncing = true
        try {
            const logs = await offlineDB.systemLogs.toArray()
            if (logs.length === 0) {
                this.isSyncing = false
                return
            }

            // Map to remove Dexie IDs before sending
            const logsToSend = logs.map(({ id, ...rest }) => rest)

            const response = await fetch('/api/logs/batch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(logsToSend)
            })

            if (response.ok) {
                // Clear the logs we just sent
                const ids = logs.map(l => l.id as number)
                await offlineDB.systemLogs.bulkDelete(ids)
                if (process.env.NODE_ENV === 'development') {
                    console.log(`[Logger] Successfully synced ${logs.length} logs.`)
                }
            } else {
                 console.error('[Logger] Sync failed with status:', response.status)
            }
        } catch (error) {
            console.error('[Logger] Sync failed:', error)
        } finally {
            this.isSyncing = false
        }
    }
}

export const logger = new Logger()
