'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { io, Socket } from 'socket.io-client'
import { useSession } from 'next-auth/react'

interface SocketContextType {
    socket: Socket | null
    isConnected: boolean
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
})

export const useSocket = () => useContext(SocketContext)

export function SocketProvider({ children }: { children: ReactNode }) {
    const { data: session } = useSession()
    const [socket, setSocket] = useState<Socket | null>(null)
    const [isConnected, setIsConnected] = useState(false)

    useEffect(() => {
        if (!session?.user) {
            // Don't connect if user is not logged in
            return
        }

        // Initialize socket connection
        const socketInstance = io({
            path: '/api/socket',
            autoConnect: true,
        })

        socketInstance.on('connect', () => {
            console.log('Socket connected:', socketInstance.id)
            setIsConnected(true)

            // Join user-specific room
            if (session.user.id) {
                socketInstance.emit('join:user', session.user.id)
            }

            // Join team rooms if user is part of teams
            // This would require fetching user's teams - for now we skip
        })

        socketInstance.on('disconnect', () => {
            console.log('Socket disconnected')
            setIsConnected(false)
        })

        socketInstance.on('connect_error', (error) => {
            console.error('Socket connection error:', error)
            setIsConnected(false)
        })

        setSocket(socketInstance)

        return () => {
            socketInstance.close()
        }
    }, [session])

    return (
        <SocketContext.Provider value={{ socket, isConnected }}>
            {children}
        </SocketContext.Provider>
    )
}
