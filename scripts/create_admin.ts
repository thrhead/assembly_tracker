import { prisma } from '../lib/db'
import { hash } from 'bcryptjs'

async function main() {
    const email = 'admin@montaj.com'
    const password = 'admin123'
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

    console.log('Admin user created/updated:', user)
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
