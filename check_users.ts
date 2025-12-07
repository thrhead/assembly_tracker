
import { prisma } from './lib/db'

async function main() {
    const users = await prisma.user.findMany();
    console.log('Total users:', users.length);
    users.forEach(u => {
        console.log(`- ${u.name} (${u.email}) role=${u.role} active=${u.isActive}`);
    });
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
