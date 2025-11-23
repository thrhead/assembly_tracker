import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const teamSchema = z.object({
  name: z.string().min(2, 'Ekip adı en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  leadId: z.string().optional(), // Opsiyonel, sonra da atanabilir
  memberIds: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    const where: any = {}

    if (search) {
      where.name = { contains: search }
    }

    const teams = await prisma.team.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        lead: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            members: true,
            assignments: true // Aktif iş sayısı için kullanılabilir
          }
        }
      }
    })

    return NextResponse.json(teams)
  } catch (error) {
    console.error('Teams fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, description, leadId, memberIds } = teamSchema.parse(body)

    const team = await prisma.team.create({
      data: {
        name,
        description,
        leadId: leadId || null,
        isActive: true,
        members: memberIds && memberIds.length > 0 ? {
          create: memberIds.map(userId => ({
            userId
          }))
        } : undefined
      },
      include: {
        lead: {
          select: {
            id: true,
            name: true
          }
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      }
    })

    // Eğer lead atandıysa, onu otomatik olarak team member yapabiliriz (Opsiyonel, şimdilik sadece lead olarak kalsın)
    // Genelde lead aynı zamanda member olur ama schema yapısına göre TeamMember tablosuna da eklemek gerekebilir.
    // Şimdilik basit tutalım.

    return NextResponse.json(team, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    console.error('Team create error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
