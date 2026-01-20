import { prisma } from './lib/db'

async function main() {
    const teams = await prisma.team.findMany({
        where: { isActive: true },
        include: {
            members: {
                include: {
                    user: true
                }
            }
        }
    })

    console.log('Active Teams with Members:', JSON.stringify(teams, null, 2))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
