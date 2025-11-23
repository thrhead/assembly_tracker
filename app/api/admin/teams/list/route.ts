import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const teams = await prisma.team.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                lead: {
                    select: {
                        name: true
                    }
                },
                _count: {
                    select: {
                        members: true
                    }
                }
            }
        })

        return NextResponse.json(teams)
    } catch (error) {
        console.error('List teams error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
