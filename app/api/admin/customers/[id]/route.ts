import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { verifyAuth } from '@/lib/auth-helper'
import { z } from 'zod'

const updateCustomerSchema = z.object({
    companyName: z.string().min(2).optional(),
    contactPerson: z.string().min(2).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
})

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const customer = await prisma.user.findUnique({
            where: { id: params.id },
            include: {
                customerProfile: true
            }
        })

        if (!customer) {
            return NextResponse.json({ error: 'Customer not found' }, { status: 404 })
        }

        return NextResponse.json(customer)
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PUT(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const data = updateCustomerSchema.parse(body)

        // Find customer to get userId
        const customer = await prisma.customer.findUnique({
            where: { id: params.id },
            include: { user: true }
        })

        if (!customer) {
            return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })
        }

        // Transaction to update User and Customer
        const result = await prisma.$transaction(async (tx) => {
            // Update User if needed
            if (data.contactPerson || data.email || data.phone) {
                await tx.user.update({
                    where: { id: customer.userId },
                    data: {
                        name: data.contactPerson,
                        email: data.email,
                        phone: data.phone
                    }
                })
            }

            // Update Customer if needed
            if (data.companyName || data.address) {
                await tx.customer.update({
                    where: { id: params.id },
                    data: {
                        company: data.companyName,
                        address: data.address
                    }
                })
            }

            return { success: true }
        })

        return NextResponse.json(result)
    } catch (error) {
        console.error('Customer update error:', error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'Invalid data', details: error.issues }, { status: 400 })
        }
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params
    try {
        const session = await verifyAuth(req)
        if (!session || session.user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Find customer to get userId
        const customer = await prisma.customer.findUnique({
            where: { id: params.id }
        })

        if (!customer) {
            return NextResponse.json({ error: 'Müşteri bulunamadı' }, { status: 404 })
        }

        // Delete User (Cascade will delete Customer)
        await prisma.user.delete({
            where: { id: customer.userId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Customer delete error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
