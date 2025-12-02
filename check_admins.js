const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const users = await prisma.user.findMany({
            where: {
                role: { in: ['ADMIN', 'MANAGER'] },
                isActive: true
            }
        });
        console.log('Active Admins/Managers:', users.length);
        users.forEach(u => console.log(`- ${u.name} (${u.role})`));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
