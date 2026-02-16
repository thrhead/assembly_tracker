import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'

export async function GET() {
  try {
    // Admin kullanıcısı zaten var mı kontrol et
    const existing = await prisma.user.findUnique({
      where: { email: 'admin@montaj.com' }
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        message: 'Admin kullanıcısı zaten mevcut ✅',
        user: { email: existing.email, name: existing.name, role: existing.role }
      })
    }

    // Yeni admin kullanıcısı oluştur
    const rawPassword = process.env.ADMIN_PASSWORD;
    if (!rawPassword) {
      return NextResponse.json({
        success: false,
        error: 'ADMIN_PASSWORD environment variable is not set!'
      }, { status: 500 });
    }

    const adminPassword = await hash(rawPassword, 10)
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
        password: '*** REMOVED ***'
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
