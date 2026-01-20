import { Server as HTTPServer } from 'http'
import { Server as SocketIOServer, Socket } from 'socket.io'
import { prisma } from '@/lib/db'

// Use global object to maintain singleton across HMR/Next.js compilations
declare global {
    var io: SocketIOServer | undefined
}

export const initSocketServer = (httpServer: HTTPServer): SocketIOServer => {
    if (global.io) {
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
        socket.on('join:user', (userId: string) => {
            socket.join(`user:${userId}`)
        })

        socket.on('join:team', (teamId: string) => {
            socket.join(`team:${teamId}`)
        })
    })

    global.io = io
    return io
}

export const getSocketServer = (): SocketIOServer | undefined => {
    return global.io
}

export const emitToUser = (userId: string, event: string, data: Record<string, unknown>) => {
    if (!global.io) return
    global.io.to(`user:${userId}`).emit(event, data)
}

export const emitToTeam = (teamId: string, event: string, data: Record<string, unknown>) => {
    if (!global.io) return
    global.io.to(`team:${teamId}`).emit(event, data)
}

export const broadcast = (event: string, data: Record<string, unknown>) => {
    if (!global.io) return
    global.io.emit(event, data)
}

export const notifyAdmins = async (event: string, data: Record<string, unknown>) => {
    if (!global.io) return

    try {
        const admins = await prisma.user.findMany({
            where: { role: 'ADMIN' },
            select: { id: true }
        })

        admins.forEach((admin) => {
            global.io!.to(`user:${admin.id}`).emit(event, data)
        })
    } catch (error) {
        console.error('❌ Error notifying admins:', error)
    }
}
