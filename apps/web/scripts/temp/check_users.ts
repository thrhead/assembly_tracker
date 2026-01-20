import { prisma } from '../../lib/db'

async function main() {
    const users = await prisma.user.findMany()
    console.log('All Users:', JSON.stringify(users, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
