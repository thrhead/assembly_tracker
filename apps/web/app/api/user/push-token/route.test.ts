import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST, DELETE } from './route'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { NextResponse } from 'next/server'

// Mock dependencies
vi.mock('@/lib/db', () => ({
    prisma: {
        pushToken: {
            upsert: vi.fn(),
            deleteMany: vi.fn(),
        }
    }
}))

vi.mock('@/lib/auth-helper', () => ({
    verifyAuth: vi.fn()
}))

describe('Push Token API', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    describe('POST /api/user/push-token', () => {
        it('should return 401 if not authenticated', async () => {
            (verifyAuth as any).mockResolvedValue(null)
            const req = new Request('http://localhost/api/user/push-token', {
                method: 'POST',
                body: JSON.stringify({ token: 'test-token' })
            })

            const res = await POST(req)
            expect(res.status).toBe(401)
        })

        it('should register a push token', async () => {
            (verifyAuth as any).mockResolvedValue({ user: { id: 'user-1' } })
            const req = new Request('http://localhost/api/user/push-token', {
                method: 'POST',
                body: JSON.stringify({ token: 'test-token' })
            })

            await POST(req)
            expect(prisma.pushToken.upsert).toHaveBeenCalledWith({
                where: { token: 'test-token' },
                update: {
                    userId: 'user-1',
                    updatedAt: expect.any(Date)
                },
                create: { token: 'test-token', userId: 'user-1' }
            })
        })
    })

    describe('DELETE /api/user/push-token', () => {
        it('should delete a push token', async () => {
            (verifyAuth as any).mockResolvedValue({ user: { id: 'user-1' } })
            const req = new Request('http://localhost/api/user/push-token', {
                method: 'DELETE',
                body: JSON.stringify({ token: 'test-token' })
            })

            await DELETE(req)
            expect(prisma.pushToken.deleteMany).toHaveBeenCalledWith({
                where: { token: 'test-token', userId: 'user-1' }
            })
        })
    })
})
