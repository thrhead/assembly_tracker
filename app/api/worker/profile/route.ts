import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'
import { logger } from '@/lib/logger';

const profileSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  phone: z.string().optional().nullable()
})

export async function GET(req: Request) {
  try {
    const session = await verifyAuth(req)
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true
      }
    })

    return NextResponse.json(user)
  } catch (error) {
    logger.error(`Profile fetch error: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const session = await verifyAuth(req)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, phone } = profileSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        phone
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true
      }
    })

    logger.info(`Profile updated for user: ${session.user.id}`);

    return NextResponse.json({ success: true, user })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    logger.error(`Profile update error: ${error instanceof Error ? error.message : String(error)}`)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
