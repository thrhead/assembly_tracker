
import { prisma } from "../lib/db"

async function main() {
    const users = await prisma.user.findMany({
        select: {
            email: true,
            role: true,
            name: true
        }
    })
    console.log("Users and Roles:")
    console.table(users)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
