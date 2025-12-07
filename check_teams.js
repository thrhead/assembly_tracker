
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const teams = await prisma.team.findMany({
            include: {
                members: true,
                lead: true
            }
        });
        console.log('Total Teams found:', teams.length);
        if (teams.length > 0) {
            console.log('Teams:', JSON.stringify(teams, null, 2));
        } else {
            console.log('No teams found in the database.');
        }
    } catch (e) {
        console.error('Error fetching teams:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
