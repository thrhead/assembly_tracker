import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'

import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reset = searchParams.get('reset') === 'true'

    const adminPassword = await hash('admin123', 10)

    // Admin kullanıcısı zaten var mı kontrol et
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@montaj.com' }
    })

    if (existing) {
      if (reset) {
        // Şifreyi sıfırla
        const updated = await prisma.user.update({
          where: { email: 'admin@montaj.com' },
          data: { passwordHash: adminPassword }
        })
        return NextResponse.json({
          success: true,
          message: 'Admin şifresi sıfırlandı! ✅ (admin123)',
          user: { email: updated.email, role: updated.role }
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Admin kullanıcısı zaten mevcut. Şifreyi sıfırlamak için ?reset=true parametresini kullanın.',
        user: { email: existing.email, name: existing.name, role: existing.role }
      })
    }

    // Yeni admin kullanıcısı oluştur
    const admin = await prisma.user.create({
      data: {
        email: 'admin@montaj.com',
        passwordHash: adminPassword,
        name: 'Admin Kullanıcı',
        role: 'ADMIN',
        phone: '555-0001',
        isActive: true,
      }
    })

    return NextResponse.json({
      success: true,
      message: '🎉 Admin kullanıcısı başarıyla oluşturuldu! Şimdi giriş yapabilirsiniz.',
      user: { email: admin.email, name: admin.name, role: admin.role },
      credentials: {
        email: 'admin@montaj.com',
        password: 'admin123'
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Bir hata oluştu'
    }, { status: 500 })
  }
}
