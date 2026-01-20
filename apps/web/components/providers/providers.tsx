'use client'

import { SessionProvider } from 'next-auth/react'
import { SocketProvider } from './socket-provider'
import { NotificationListener } from './notification-listener'
import { ReactNode } from 'react'

export function Providers({ children }: { children: ReactNode }) {
    return (
        <SessionProvider>
            <SocketProvider>
                {children}
                <NotificationListener />
            </SocketProvider>
        </SessionProvider>
    )
}
