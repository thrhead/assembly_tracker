import { syncManager } from './sync-manager'
import { toast } from 'sonner'

type ApiMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

interface ApiOptions extends RequestInit {
    params?: Record<string, string>
}

/**
 * Global API Client with Offline Support
 */
export const apiClient = {
    async request(url: string, options: ApiOptions = {}) {
        const method = (options.method || 'GET').toUpperCase() as ApiMethod
        const isWriteOperation = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
        
        // 1. Check Network Status
        const isOffline = typeof navigator !== 'undefined' && !navigator.onLine

        if (isOffline && isWriteOperation) {
            console.log(`[API] Offline - Queueing ${method} request to ${url}`)
            
            await syncManager.addToQueue({
                type: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
                url,
                payload: options.body ? JSON.parse(options.body as string) : undefined
            })

            toast.warning('Çevrimdışı: İşlem kuyruğa alındı. İnternet gelince gönderilecek.', {
                description: url
            })

            // Return a mock success response so UI doesn't break
            return {
                ok: true,
                status: 202,
                statusText: 'Accepted (Queued)',
                json: async () => ({ message: 'Queued', offline: true }),
            }
        }

        // 2. Online Request
        try {
            const response = await fetch(url, options)

            // If it's a server error or unauthorized, we don't auto-queue 
            // but we could handle specific cases here
            return response
        } catch (error) {
            // 3. Handle Fetch Failures (Network issues while thinking we are online)
            if (isWriteOperation) {
                console.log(`[API] Request failed - Queueing ${method} request to ${url}`)
                await syncManager.addToQueue({
                    type: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
                    url,
                    payload: options.body ? JSON.parse(options.body as string) : undefined
                })
                
                toast.warning('Bağlantı Sorunu: İşlem kuyruğa alındı.', {
                    description: 'İnternet bağlantınız kararsız görünüyor.'
                })

                return {
                    ok: true,
                    status: 202,
                    json: async () => ({ message: 'Queued', offline: true }),
                }
            }
            
            throw error
        }
    },

    async get(url: string, options?: Omit<ApiOptions, 'method'>) {
        return this.request(url, { ...options, method: 'GET' })
    },

    async post(url: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request(url, { 
            ...options, 
            method: 'POST', 
            body: JSON.stringify(body) 
        })
    },

    async put(url: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request(url, { 
            ...options, 
            method: 'PUT', 
            body: JSON.stringify(body) 
        })
    },

    async patch(url: string, body: any, options?: Omit<ApiOptions, 'method' | 'body'>) {
        return this.request(url, { 
            ...options, 
            method: 'PATCH', 
            body: JSON.stringify(body) 
        })
    },

    async delete(url: string, options?: Omit<ApiOptions, 'method'>) {
        return this.request(url, { ...options, method: 'DELETE' })
    }
}
