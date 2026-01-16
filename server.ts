/**
 * Custom Next.js serverfor Socket.IO integration
 * This file initializes both the Next.js app and Socket.IO server
 */

/**
 * Custom Next.js serverfor Socket.IO integration
 * This file initializes both the Next.js app and Socket.IO server
 */

import 'dotenv/config'
// Force disable Turbopack to prevent panics
process.env.TURBOPACK = "0"

import { createServer } from 'http'
import { parse } from 'url'
// Use require to avoid hoisting issues, ensuring TURBOPACK env var is set before next loads
const next = require('next')
import { initSocketServer } from './lib/socket'

const dev = process.env.NODE_ENV !== 'production'
const hostname = '0.0.0.0'
const port = parseInt(process.env.PORT || '3000', 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
    const server = createServer(async (req, res) => {
        // [DEBUG] Log every request reaching the server
        console.log(`[SERVER] ${req.method} ${req.url}`);

        // [FIX] Enable CORS specifically for mobile/external access
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

        // Handle Preflight (OPTIONS) immediately
        if (req.method === 'OPTIONS') {
            res.statusCode = 200;
            res.end();
            return;
        }

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