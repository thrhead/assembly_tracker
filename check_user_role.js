const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUserRole() {
    const userId = 'cmitspuqo0000k263t4x7ej8o';
    console.log('Checking role for user:', userId);

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, name: true, email: true, role: true }
        });

        console.log('User Found:', JSON.stringify(user, null, 2));
    } catch (error) {
        console.error('Error:', error);
    }
}

checkUserRole()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
