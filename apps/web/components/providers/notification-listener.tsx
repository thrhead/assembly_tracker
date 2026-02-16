'use client'

import { useEffect } from 'react'
import { useSocket } from './socket-provider'
import { toast } from 'sonner'
import {
    JobCompletedPayload,
    CostSubmittedPayload,
    CostApprovedPayload,
    StepCompletedPayload,
    NotificationPayload,
} from '@/lib/socket-events'

export function NotificationListener() {
    const { socket, isConnected } = useSocket()

    useEffect(() => {
        if (!socket || !isConnected) return

        // Job completed notification
        socket.on('job:completed', (data: JobCompletedPayload) => {
            toast.success('İş Tamamlandı', {
                description: `${data.title} işi ${data.completedBy} tarafından tamamlandı.`,
            })
        })

        // Cost submitted notification
        socket.on('cost:submitted', (data: CostSubmittedPayload) => {
            toast.info('Yeni Masraf', {
                description: `${data.submittedBy} tarafından ${data.amount} ₺ masraf kaydedildi.`,
            })
        })

        // Cost approved notification
        socket.on('cost:approved', (data: CostApprovedPayload) => {
            toast.success('Masraf Onaylandı', {
                description: `${data.amount} ₺ tutarındaki masraf onaylandı.`,
            })
        })

        // Step completed notification
        socket.on('step:completed', (data: StepCompletedPayload) => {
            toast.success('Adım Tamamlandı', {
                description: `${data.stepTitle} adımı tamamlandı.`,
            })
        })

        // Generic notification
        socket.on('notification:new', (data: NotificationPayload) => {
            const toastFn = data.type === 'success' ? toast.success :
                data.type === 'error' ? toast.error :
                    data.type === 'warning' ? toast.warning :
                        toast.info

            toastFn(data.title, {
                description: data.message,
            })
        })

        return () => {
            socket.off('job:completed')
            socket.off('cost:submitted')
            socket.off('cost:approved')
            socket.off('step:completed')
            socket.off('notification:new')
        }
    }, [socket, isConnected])

    return null // This component only listens, doesn't render anything
}
