
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('🌱 Seeding teams...');

        // Find users
        const tahir = await prisma.user.findUnique({ where: { email: 'tahir@montaj.com' } });
        const ali = await prisma.user.findUnique({ where: { email: 'ali@montaj.com' } });
        const worker = await prisma.user.findUnique({ where: { email: 'worker@montaj.com' } });

        if (!tahir || !ali || !worker) {
            console.error('❌ Required users not found. Run "npx prisma db seed" first.');
            return;
        }

        // Create Team A
        const teamA = await prisma.team.create({
            data: {
                name: 'Montaj Ekibi A',
                description: 'Klima ve havalandırma montaj ekibi',
                leadId: tahir.id,
                isActive: true,
                members: {
                    create: [
                        { userId: ali.id },
                        { userId: tahir.id }
                    ]
                }
            }
        });
        console.log('✅ Created Team:', teamA.name);

        // Create Team B
        const teamB = await prisma.team.create({
            data: {
                name: 'Montaj Ekibi B',
                description: 'Genel montaj ve bakım ekibi',
                isActive: true,
                members: {
                    create: [
                        { userId: worker.id }
                    ]
                }
            }
        });
        console.log('✅ Created Team:', teamB.name);

    } catch (e) {
        console.error('Error seeding teams:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
