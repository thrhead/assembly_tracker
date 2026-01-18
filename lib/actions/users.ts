'use server'

import { z } from 'zod'
import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { registerSchema } from '@/lib/validations'
import { hash } from 'bcryptjs'

export async function createUserAction(data: z.infer<typeof registerSchema>) {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Yetkisiz işlem')
    }

    const validated = registerSchema.safeParse(data)

    if (!validated.success) {
        throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
    }

    const { name, email, password, phone, role } = validated.data

    try {
        // Check if email exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            throw new Error('Bu e-posta adresi zaten kullanımda')
        }

        const passwordHash = await hash(password, 10)

        await prisma.user.create({
            data: {
                name,
                email,
                passwordHash,
                phone,
                role,
                isActive: true
            }
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('User creation error:', error)
        throw new Error(error.message || 'Kullanıcı oluşturulurken bir hata oluştu')
    }
}

// Update schema: password optional
const userUpdateSchema = z.object({
    id: z.string(),
    name: z.string().min(2, 'İsim en az 2 karakter olmalıdır'),
    email: z.string().email('Geçerli bir e-posta adresi giriniz'),
    password: z.string().optional().or(z.literal('')),
    phone: z.string().optional(),
    role: z.enum(['ADMIN', 'MANAGER', 'TEAM_LEAD', 'WORKER', 'CUSTOMER']),
    isActive: z.boolean().optional(),
})

export async function updateUserAction(data: z.infer<typeof userUpdateSchema>) {
    const session = await auth()

    if (!session || session.user.role !== 'ADMIN') {
        throw new Error('Yetkisiz işlem')
    }

    const validated = userUpdateSchema.safeParse(data)

    if (!validated.success) {
        throw new Error('Geçersiz veri: ' + JSON.stringify(validated.error.flatten()))
    }

    const { id, name, email, password, phone, role, isActive } = validated.data

    try {
        const updateData: any = {
            name,
            email,
            phone,
            role,
            isActive
        }

        if (password && password.length >= 6) {
            updateData.passwordHash = await hash(password, 10)
        }

        await prisma.user.update({
            where: { id },
            data: updateData
        })

        revalidatePath('/admin/users')
        return { success: true }
    } catch (error: any) {
        console.error('User update error:', error)
        throw new Error(error.message || 'Kullanıcı güncellenirken bir hata oluştu')
    }
}
