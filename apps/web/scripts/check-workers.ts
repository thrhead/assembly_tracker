import { prisma } from './lib/db'

async function main() {
    const workers = await prisma.user.findMany({
        where: { role: 'WORKER', isActive: true },
        select: { id: true, name: true, email: true, role: true, isActive: true }
    })

    const teams = await prisma.team.findMany({
        where: { isActive: true },
        select: { id: true, name: true, isActive: true }
    })

    console.log('Active Workers:', JSON.stringify(workers, null, 2))
    console.log('Active Teams:', JSON.stringify(teams, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
