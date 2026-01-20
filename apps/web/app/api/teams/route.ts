import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { z } from 'zod'
import { verifyAuth } from '@/lib/auth-helper'

// CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders })
}

const teamSchema = z.object({
  name: z.string().min(2, 'Ekip adı en az 2 karakter olmalıdır'),
  description: z.string().optional(),
  leadId: z.string().optional(),
  memberIds: z.array(z.string()).optional(),
})

export async function GET(req: Request) {
  try {
    const session = await verifyAuth(req)
    console.log('[API] Teams GET Request - Session Role:', session?.user?.role)

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
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
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            members: true,
            assignments: true
          }
        }
      }
    })

    return NextResponse.json(teams, { headers: corsHeaders })
  } catch (error) {
    console.error('Teams fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders })
  }
}

export async function POST(req: Request) {
  try {
    const session = await verifyAuth(req)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const body = await req.json()
    const { name, description, leadId, memberIds } = teamSchema.parse(body)

    // Validate leadId if provided
    let validatedLeadId = null
    if (leadId && leadId.trim()) {
      const leadExists = await prisma.user.findUnique({
        where: { id: leadId }
      })
      if (leadExists) {
        validatedLeadId = leadId
      }
    }

    const team = await prisma.team.create({
      data: {
        name,
        description,
        leadId: validatedLeadId,
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
                name: true,
                email: true,
                role: true,
                phone: true,
                avatarUrl: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json(team, { status: 201, headers: corsHeaders })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400, headers: corsHeaders })
    }
    console.error('Team create error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500, headers: corsHeaders })
  }
}
