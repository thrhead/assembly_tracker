'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { syncManager } from '@/lib/sync-manager'
import { offlineDB } from '@/lib/offline-db'
import { useNetwork } from '@/hooks/use-network'
import { toast } from 'sonner'

interface SyncContextType {
    pendingCount: number
    syncNow: () => Promise<void>
}

const SyncContext = createContext<SyncContextType>({
    pendingCount: 0,
    syncNow: async () => {},
})

export const useSync = () => useContext(SyncContext)

export function SyncProvider({ children }: { children: ReactNode }) {
    const isOnline = useNetwork()
    const [pendingCount, setPendingCount] = useState(0)

    // Monitor queue count
    useEffect(() => {
        const updateCount = async () => {
            const count = await offlineDB.syncQueue.count()
            setPendingCount(count)
        }

        updateCount()
        
        // Polling for changes in queue count (simple but effective for offline DB)
        const interval = setInterval(updateCount, 5000)
        return () => clearInterval(interval)
    }, [])

    // Trigger sync when coming back online
    useEffect(() => {
        if (isOnline && pendingCount > 0) {
            toast.info('İnternet bağlantısı sağlandı. Veriler senkronize ediliyor...', {
                id: 'sync-status'
            })
            syncManager.processQueue().then(() => {
                // Check if everything synced
                offlineDB.syncQueue.count().then(count => {
                    if (count === 0) {
                        toast.success('Senkronizasyon tamamlandı.', { id: 'sync-status' })
                        setPendingCount(0)
                    }
                })
            })
        }
    }, [isOnline, pendingCount])

    return (
        <SyncContext.Provider value={{ pendingCount, syncNow: () => syncManager.processQueue() }}>
            {children}
            {pendingCount > 0 && !isOnline && (
                <div className="fixed bottom-4 right-4 z-50 rounded-full bg-orange-500 px-4 py-2 text-xs font-bold text-white shadow-lg animate-pulse">
                    Çevrimdışı: {pendingCount} işlem bekliyor
                </div>
            )}
        </SyncContext.Provider>
    )
}
