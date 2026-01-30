import { NextResponse } from 'next/server'

export async function checkConflict(req: Request, updatedAt: Date | string | null | undefined) {
    const clientVersion = req.headers.get('X-Client-Version')

    // If no version provided, we let it skip (optional/legacy support)
    if (!clientVersion || clientVersion === '0' || !updatedAt) {
        return null
    }

    const serverTime = new Date(updatedAt).getTime()
    const clientTime = new Date(clientVersion).getTime()

    // If server's last update is newer than what client thinks, it's a conflict
    // Allow a small margin of error (2 seconds) for sync jitter
    if (serverTime > clientTime + 2000) {
        return NextResponse.json({
            error: 'Conflict: The resource has been modified on the server.',
            serverVersion: updatedAt,
            clientVersion: clientVersion
        }, { status: 409 })
    }

    return null
}
