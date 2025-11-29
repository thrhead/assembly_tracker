import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { NextApiResponse } from 'next'

export type SocketServer = SocketIOServer

// Use global object to maintain singleton across HMR/Next.js compilations
declare global {
    var io: SocketIOServer | undefined
}

export const initSocketServer = (httpServer: HTTPServer): SocketIOServer => {
    if (global.io) {
        console.log('⚠️ Socket.IO already initialized')
        return global.io
    }

    console.log('🔌 Initializing Socket.IO server...')
    const io = new SocketIOServer(httpServer, {
        path: '/api/socket',
        addTrailingSlash: false,
        cors: {
            origin: '*',
            methods: ['GET', 'POST'],
        },
    })

    io.on('connection', (socket: Socket) => {
        console.log('👤 Client connected:', socket.id)

        socket.on('join:user', (userId: string) => {
            socket.join(`user:${userId}`)
            console.log(`🏠 User ${userId} joined their room`)
        })

        socket.on('join:team', (teamId: string) => {
            socket.join(`team:${teamId}`)
            console.log(`🏢 Joined team room: ${teamId}`)
        })

        socket.on('disconnect', () => {
            console.log('❌ Client disconnected:', socket.id)
        })
    })

    global.io = io
    return io
}

export const getSocketServer = (): SocketIOServer | undefined => {
    return global.io
}

export const emitToUser = (userId: string, event: string, data: any) => {
    if (!global.io) {
        console.warn('⚠️ Cannot emit to user: Socket.IO not initialized')
        return
    }
    console.log(`📤 Emitting ${event} to user:${userId}`)
    global.io.to(`user:${userId}`).emit(event, data)
}

export const emitToTeam = (teamId: string, event: string, data: any) => {
    if (!global.io) return
    global.io.to(`team:${teamId}`).emit(event, data)
}

export const broadcast = (event: string, data: any) => {
    if (!global.io) return
    global.io.emit(event, data)
}

export const notifyAdmins = async (event: string, data: any) => {
    if (!global.io) {
        console.warn('⚠️ Cannot notify admins: Socket.IO not initialized')
        return
    }

    try {
        const { prisma } = require('@/lib/db')
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true, name: true }
        })

        console.log(`📢 Notifying ${admins.length} admin(s) with event: ${event}`)

        admins.forEach((admin: { id: string; name: string | null }) => {
            global.io!.to(`user:${admin.id}`).emit(event, data)
        })
    } catch (error) {
        console.error('❌ Error notifying admins:', error)
    }
}
