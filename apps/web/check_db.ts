import { prisma } from './lib/db';

async function check() {
    try {
        const count = await prisma.user.count();
        console.log('USER_COUNT:' + count);
        if (count > 0) {
            const users = await prisma.user.findMany({ select: { email: true } });
            console.log('USERS:' + JSON.stringify(users));
        }
    } catch (e: any) {
        console.error('ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

check();
