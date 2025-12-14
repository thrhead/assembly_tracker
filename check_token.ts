
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUserToken() {
    const email = 'ali@montaj.com';
    const user = await prisma.user.findUnique({
        where: { email },
        select: { id: true, name: true, email: true, pushToken: true }
    });

    console.log('User Check Result:', user);
}

checkUserToken()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
