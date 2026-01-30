import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(req: Request) {
    try {
        const session = await auth()
        if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const level = searchParams.get('level')
        const platform = searchParams.get('platform')
        const search = searchParams.get('search')
        const limit = parseInt(searchParams.get('limit') || '50')
        const page = parseInt(searchParams.get('page') || '1')

        const where: any = {}
        if (level) where.level = level
        if (platform) where.platform = platform
        if (search) {
            where.OR = [
                { message: { contains: search, mode: 'insensitive' } },
                { user: { name: { contains: search, mode: 'insensitive' } } }
            ]
        }

        const [logs, total] = await Promise.all([
            prisma.systemLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                take: limit,
                skip: (page - 1) * limit,
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true,
                            role: true
                        }
                    }
                }
            }),
            prisma.systemLog.count({ where })
        ])

        return NextResponse.json({
            logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error('Admin logs fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

/**
 * Prune technical logs older than 30 days
 * keeps AUDIT logs indefinitely
 */
export async function DELETE(req: Request) {
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const ninetyDaysAgo = new Date()
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)

        const result = await prisma.systemLog.deleteMany({
            where: {
                level: { not: 'AUDIT' },
                createdAt: { lt: ninetyDaysAgo }
            }
        })

        return NextResponse.json({
            success: true,
            message: `${result.count} old technical logs pruned.`
        })
    } catch (error) {
        console.error('Prune logs error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
