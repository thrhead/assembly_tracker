import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hash } from 'bcryptjs'
import { z } from 'zod'
import { auth } from '@/lib/auth'

// Customer Schema
const customerSchema = z.object({
  name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
  email: z.string().email('Geçerli bir e-posta adresi giriniz'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
  phone: z.string().optional(),
  company: z.string().min(2, 'Firma adı en az 2 karakter olmalıdır'),
  address: z.string().optional(),
  taxId: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(req: Request) {
  try {
    const session = await auth()
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'MANAGER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')

    const where: any = {}

    if (search) {
      where.OR = [
        { company: { contains: search } },
        { user: { name: { contains: search } } },
        { user: { email: { contains: search } } }
      ]
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isActive: true,
            createdAt: true
          }
        },
        _count: {
          select: {
            jobs: true
          }
        }
      }
    })

    return NextResponse.json(customers)
  } catch (error) {
    console.error('Customers fetch error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
      name, email, password, phone,
      company, address, taxId, notes
    } = customerSchema.parse(body)

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanımda' },
        { status: 400 }
      )
    }

    const hashedPassword = await hash(password, 10)

    // Transaction ile hem User hem Customer oluştur
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create User
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: 'CUSTOMER',
          phone,
          isActive: true
        }
      })

      // 2. Create Customer Profile
      const customer = await tx.customer.create({
        data: {
          userId: user.id,
          company,
          address,
          taxId,
          notes
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        }
      })

      return customer
    })

    return NextResponse.json(result, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: (error as any).errors }, { status: 400 })
    }
    console.error('Customer create error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
