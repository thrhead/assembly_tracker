
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const userCount = await prisma.user.count();
        const jobCount = await prisma.job.count();
        const users = await prisma.user.findMany({ select: { email: true, role: true } });

        console.log('--- DB Check ---');
        console.log(`Users: ${userCount}`);
        console.log(`Jobs: ${jobCount}`);
        console.log('Users list:', users);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
