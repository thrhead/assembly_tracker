import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const members = await prisma.teamMember.findMany({
            where: { teamId: params.id },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { joinedAt: 'asc' }
        })

        return NextResponse.json(members)
    } catch (error) {
        console.error('Get team members error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId } = await req.json()

        const member = await prisma.teamMember.create({
            data: {
                teamId: params.id,
                userId
            },
            include: {
                user: {
                    select: {
                        name: true
                    }
                }
            }
        })

        return NextResponse.json(member)
    } catch (error) {
        console.error('Add team member error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await auth()
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const { userId } = await req.json()

        await prisma.teamMember.deleteMany({
            where: {
                teamId: params.id,
                userId
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Remove team member error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
