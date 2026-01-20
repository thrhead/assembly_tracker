/**
 * Custom Next.js serverfor Socket.IO integration
 * This file initializes both the Next.js app and Socket.IO server
 */

/**
 * Custom Next.js serverfor Socket.IO integration
 * This file initializes both the Next.js app and Socket.IO server
 */

import { createServer } from 'http'
import { parse } from 'url'
import next from 'next'
import { initSocketServer } from './lib/socket'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

// Disable Turbopack to prevent Windows junction point errors
process.env.NEXT_PRIVATE_TURBOPACK = '0'

const app = next({
    dev,
    hostname,
    port
})
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        try {
            const parsedUrl = parse(req.url!, true)
            await handle(req, res, parsedUrl)
        } catch (err) {
            console.error('Error occurred handling', req.url, err)
            res.statusCode = 500
            res.end('internal server error')
        }
    })

    // Initialize Socket.IO server
    const io = initSocketServer(server)
    console.log('✅ Socket.IO server initialized')

    server.listen(port, hostname, () => {
        console.log(`> Ready on http://${hostname}:${port}`)
    })
})