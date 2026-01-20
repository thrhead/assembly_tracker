'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { hash } from 'bcryptjs'

// Define schema here if not in validations, or import it.
// Assuming we want a specific schema for customer creation which includes company info.
const customerCreateSchema = z.object({
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
    phone: z.string().optional(),
    company: z.string().min(2, 'Firma adı en az 2 karakter olmalıdır'),
    address: z.string().optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
})

export async function createCustomerAction(data: z.infer<typeof customerCreateSchema>) {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Yetkisiz işlem')
    }

    const validated = customerCreateSchema.safeParse(data)

    if (!validated.success) {
        throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
    }

    const { name, email, password, phone, company, address, taxId, notes } = validated.data

    try {
        await prisma.$transaction(async (tx) => {
            // Check email
            const existingUser = await tx.user.findUnique({ where: { email } })
            if (existingUser) {
                throw new Error('Bu e-posta adresi zaten kullanımda')
            }

            const passwordHash = await hash(password, 10)

            // Create User
            const user = await tx.user.create({
                data: {
                    name,
                    email,
                    passwordHash,
                    phone,
                    role: 'CUSTOMER',
                    isActive: true
                }
            })

            // Create Customer Profile
            await tx.customer.create({
                data: {
                    userId: user.id,
                    company,
                    address,
                    taxId,
                    notes
                }
            })
        })

        revalidatePath('/admin/customers')
        return { success: true }
    } catch (error: any) {
        console.error('Customer creation error:', error)
        throw new Error(error.message || 'Müşteri oluşturulurken bir hata oluştu')
    }
}

// Update schema: password optional
const customerUpdateSchema = z.object({
    id: z.string(),
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().optional().or(z.literal('')),
    phone: z.string().optional(),
    company: z.string().min(2, 'Firma adı en az 2 karakter olmalıdır'),
    address: z.string().optional(),
    taxId: z.string().optional(),
    notes: z.string().optional(),
})

export async function updateCustomerAction(data: z.infer<typeof customerUpdateSchema>) {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Yetkisiz işlem')
    }

    const validated = customerUpdateSchema.safeParse(data)

    if (!validated.success) {
        throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
    }

    const { id, name, email, password, phone, company, address, taxId, notes } = validated.data

    try {
        await prisma.$transaction(async (tx) => {
            // Get existing customer to find userId
            const existingCustomer = await tx.customer.findUnique({
                where: { id },
                include: { user: true }
            })

            if (!existingCustomer) {
                throw new Error('Müşteri bulunamadı')
            }

            // Update User
            const updateUserData: any = {
                name,
                email,
                phone
            }

            if (password && password.length >= 6) {
                updateUserData.passwordHash = await hash(password, 10)
            }

            await tx.user.update({
                where: { id: existingCustomer.userId },
                data: updateUserData
            })

            // Update Customer Profile
            await tx.customer.update({
                where: { id },
                data: {
                    company,
                    address,
                    taxId,
                    notes
                }
            })
        })

        revalidatePath('/admin/customers')
        return { success: true }
    } catch (error: any) {
        console.error('Customer update error:', error)
        throw new Error(error.message || 'Müşteri güncellenirken bir hata oluştu')
    }
}
