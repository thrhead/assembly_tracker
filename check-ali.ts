import { prisma } from './lib/db'

async function checkUser() {
    try {
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: 'Ali'
                }
            }
        })
        console.log('Found users:', JSON.stringify(users, null, 2))
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkUser()
