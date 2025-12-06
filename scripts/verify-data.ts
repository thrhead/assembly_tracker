
import { prisma } from "../lib/db"

async function main() {
    const customers = await prisma.customer.findMany({
        include: { user: true }
    })

    const teams = await prisma.team.findMany({
        include: { members: true }
    })

    console.log("=== CUSTOMERS ===")
    console.table(customers.map(c => ({
        id: c.id,
        company: c.company,
        userId: c.userId,
        userName: c.user.name
    })))

    console.log("\n=== TEAMS ===")
    console.table(teams.map(t => ({
        id: t.id,
        name: t.name,
        memberCount: t.members.length
    })))
}

main()
    .catch(e => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
