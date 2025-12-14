
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkNotifications() {
    const email = 'ali@montaj.com';
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            notifications: {
                orderBy: { createdAt: 'desc' },
                take: 5
            }
        }
    });

    console.log('User Notifications:', user?.notifications);
}

checkNotifications()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
