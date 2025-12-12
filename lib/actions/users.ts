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
