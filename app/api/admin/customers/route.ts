import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAdmin, verifyAdminOrManager } from '@/lib/auth-helper'
import { z } from 'zod'
import { hash } from 'bcryptjs'
import { createCustomerSchema } from '@/lib/validations'

export async function GET(req: Request) {
    try {
        const session = await verifyAdminOrManager(req)

        if (!session) {
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
            include: {
                user: {
                    select: {
                        name: true,
                        email: true,
                        phone: true,
                    }
                },
                _count: {
                    select: {
                        jobs: {
                            where: {
                                status: {
                                    not: 'COMPLETED'
                                }
                            }
                        }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        // Transform data to match screen requirements
        const formattedCustomers = customers.map(c => ({
            id: c.id,
            userId: c.userId,
            companyName: c.company,
            contactPerson: c.user.name,
            email: c.user.email,
            phone: c.user.phone,
            address: c.address,
            activeJobs: c._count.jobs
        }))

        return NextResponse.json(formattedCustomers)
    } catch (error) {
        console.error('Customers fetch error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await verifyAdmin(req)
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const data = createCustomerSchema.parse(body)

        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            return NextResponse.json({ error: 'Bu e-posta adresi zaten kullanımda' }, { status: 400 })
        }

        // Default password for customers
        const passwordHash = await hash('123456', 12)

        // Transaction to create User and Customer
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    name: data.contactPerson,
                    email: data.email,
                    phone: data.phone,
                    role: 'CUSTOMER',
                    passwordHash,
                    isActive: true
                }
            })

            const customer = await tx.customer.create({
                data: {
                    userId: user.id,
                    company: data.companyName,
                    address: data.address
                }
            })

            return { ...customer, user }
        })

        return NextResponse.json(result, { status: 201 })
    } catch (error) {
        console.error('Customer create error:', error)
        if (error instanceof z.ZodError) {
            const errorMessage = error.issues.map(issue => issue.message).join(', ')
            return NextResponse.json({ error: errorMessage, details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
