import { prisma } from '../lib/db'
import { hash } from 'bcryptjs'

async function main() {
    const email = process.env.ADMIN_EMAIL
    const password = process.env.ADMIN_PASSWORD
    const hashedPassword = await hash(password, 10)

    const user = await prisma.user.upsert({
        where: { email },
        update: {
            passwordHash: hashedPassword,
            role: 'ADMIN',
            isActive: true
        },
        create: {
            email,
            name: 'Admin',
            passwordHash: hashedPassword,
            role: 'ADMIN',
            isActive: true
        }
    })

    console.log('Admin user created/updated:', user.email)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })