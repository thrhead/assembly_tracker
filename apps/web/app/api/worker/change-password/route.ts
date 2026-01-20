import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@/lib/auth'
import { hash, compare } from 'bcryptjs'
import { z } from 'zod'

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Mevcut şifre gerekli'),
  newPassword: z.string().min(6, 'Yeni şifre en az 6 karakter olmalıdır')
})

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== 'WORKER' && session.user.role !== 'TEAM_LEAD')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { currentPassword, newPassword } = passwordSchema.parse(body)

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Verify current password
    const isValidPassword = await compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Mevcut şifre yanlış' }, { status: 400 })
    }

    // Hash new password
    const newPasswordHash = await hash(newPassword, 10)

    // Update password
    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: newPasswordHash }
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Şifreniz başarıyla değiştirildi' 
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    console.error('Password change error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
