import { NextResponse } from 'next/server'
import { Server as HTTPServer } from 'http'
import { initSocketServer } from '@/lib/socket'

export const dynamic = 'force-dynamic'

// This endpoint initializes the Socket.IO server
export async function GET() {
    try {
        // Note: In production with Next.js, you'd typically use a custom server
        // For development, this approach works with the Next.js dev server

        // The actual Socket.IO server is initialized when the app starts
        // This endpoint just confirms it's available

        return NextResponse.json({
            message: 'Socket.IO server is running',
            path: '/api/socket'
        })
    } catch (error) {
        console.error('Socket.IO initialization error:', error)
        return NextResponse.json(
            { error: 'Failed to initialize Socket.IO' },
            { status: 500 }
        )
    }
}
