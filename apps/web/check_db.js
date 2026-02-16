const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const count = await prisma.user.count();
        console.log('USER_COUNT:' + count);
        if (count > 0) {
            const users = await prisma.user.findMany({ select: { email: true } });
            console.log('USERS:' + JSON.stringify(users));
        } else {
            console.log('DATABASE_IS_EMPTY');
        }
    } catch (e) {
        console.error('ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
